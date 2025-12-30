-- Admin Panel Extra Tables
-- Run this SQL in your Supabase SQL Editor
-- Version 2: Fixed triggers

-- ============================================
-- CONTACT SUBMISSIONS (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  reason TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_read ON contact_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- ============================================
-- ACTIVITY LOGS (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,  -- Changed from user_id UUID to TEXT to be more flexible
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- RLS POLICIES (drop existing first to avoid conflicts)
-- ============================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Service role full access on activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

-- Allow service role full access
CREATE POLICY "Service role full access on contact_submissions"
  ON contact_submissions FOR ALL
  USING (true);

CREATE POLICY "Service role full access on activity_logs"
  ON activity_logs FOR ALL
  USING (true);

-- Allow public inserts on contact submissions (for contact form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTION: Log Activity (simple version)
-- ============================================

CREATE OR REPLACE FUNCTION log_activity_simple(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (NULL, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
