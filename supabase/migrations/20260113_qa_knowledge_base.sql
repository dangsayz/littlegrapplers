-- ============================================
-- QA Knowledge Base Tables
-- Autonomous QA System Data Storage
-- ============================================

-- Failure Signatures Table
CREATE TABLE IF NOT EXISTS qa_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  context JSONB NOT NULL,
  error JSONB NOT NULL,
  system_state JSONB NOT NULL,
  resolution JSONB,
  occurrence_count INTEGER DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_failures_fingerprint ON qa_failures(fingerprint);
CREATE INDEX IF NOT EXISTS idx_qa_failures_category ON qa_failures(category);
CREATE INDEX IF NOT EXISTS idx_qa_failures_severity ON qa_failures(severity);
CREATE INDEX IF NOT EXISTS idx_qa_failures_created_at ON qa_failures(created_at);

-- Pattern Rules Table
CREATE TABLE IF NOT EXISTS qa_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fingerprints TEXT[] NOT NULL DEFAULT '{}',
  match_conditions JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  min_severity TEXT NOT NULL DEFAULT 'medium',
  resolution JSONB NOT NULL,
  occurrences INTEGER DEFAULT 0,
  last_occurrence TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  confidence DECIMAL(3,2) DEFAULT 0.50 CHECK (confidence >= 0 AND confidence <= 1),
  manual_overrides INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_patterns_category ON qa_patterns(category);
CREATE INDEX IF NOT EXISTS idx_qa_patterns_enabled ON qa_patterns(enabled);
CREATE INDEX IF NOT EXISTS idx_qa_patterns_confidence ON qa_patterns(confidence);

-- Resolution Audit Log
CREATE TABLE IF NOT EXISTS qa_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_id UUID REFERENCES qa_failures(id) ON DELETE SET NULL,
  pattern_id UUID REFERENCES qa_patterns(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  duration_ms INTEGER,
  error JSONB,
  rollback_executed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_resolutions_failure_id ON qa_resolutions(failure_id);
CREATE INDEX IF NOT EXISTS idx_qa_resolutions_pattern_id ON qa_resolutions(pattern_id);
CREATE INDEX IF NOT EXISTS idx_qa_resolutions_success ON qa_resolutions(success);

-- Invariant Check History
CREATE TABLE IF NOT EXISTS qa_invariant_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invariant_id TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  data JSONB,
  message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_invariant_checks_invariant_id ON qa_invariant_checks(invariant_id);
CREATE INDEX IF NOT EXISTS idx_qa_invariant_checks_passed ON qa_invariant_checks(passed);
CREATE INDEX IF NOT EXISTS idx_qa_invariant_checks_checked_at ON qa_invariant_checks(checked_at);

-- Validation Mesh Results
CREATE TABLE IF NOT EXISTS qa_mesh_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passed BOOLEAN NOT NULL,
  confidence DECIMAL(3,2),
  layer_results JSONB NOT NULL,
  cross_validation JSONB,
  total_issues INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_mesh_results_passed ON qa_mesh_results(passed);
CREATE INDEX IF NOT EXISTS idx_qa_mesh_results_created_at ON qa_mesh_results(created_at);

-- Escalations (issues requiring manual review)
CREATE TABLE IF NOT EXISTS qa_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_id UUID REFERENCES qa_failures(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  error_message TEXT,
  context JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_qa_escalations_status ON qa_escalations(status);
CREATE INDEX IF NOT EXISTS idx_qa_escalations_severity ON qa_escalations(severity);

-- Circuit Breakers State
CREATE TABLE IF NOT EXISTS circuit_breakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT UNIQUE NOT NULL,
  state TEXT DEFAULT 'closed' CHECK (state IN ('open', 'half-open', 'closed')),
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_failure TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circuit_breakers_route ON circuit_breakers(route);
CREATE INDEX IF NOT EXISTS idx_circuit_breakers_state ON circuit_breakers(state);

-- Security Logs (for suspicious activity tracking)
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- Rate Limit Logs
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  route TEXT NOT NULL,
  ip TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_id ON rate_limit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_route ON rate_limit_logs(route);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_timestamp ON rate_limit_logs(timestamp);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to increment occurrence count
CREATE OR REPLACE FUNCTION increment_occurrence(fp TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE qa_failures 
  SET occurrence_count = occurrence_count + 1,
      last_seen = NOW()
  WHERE fingerprint = fp
  RETURNING occurrence_count INTO new_count;
  
  RETURN COALESCE(new_count, 1);
END;
$$ LANGUAGE plpgsql;

-- Function for generic increment
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE qa_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_escalations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on qa_failures" ON qa_failures
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_patterns" ON qa_patterns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_resolutions" ON qa_resolutions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_escalations" ON qa_escalations
  FOR ALL USING (auth.role() = 'service_role');
