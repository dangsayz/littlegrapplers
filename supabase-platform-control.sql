-- Platform Control System Migration
-- Adds platform status tracking for kill-switch and automated payment enforcement

-- Create platform_status table for global platform control
CREATE TABLE IF NOT EXISTS platform_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_reason TEXT,
  disabled_by TEXT,
  disabled_at TIMESTAMPTZ,
  -- Payment tracking for automated enforcement
  payment_due_date DATE,
  payment_received_at TIMESTAMPTZ,
  payment_overdue_days INTEGER DEFAULT 0,
  auto_disabled BOOLEAN DEFAULT false,
  -- Metadata
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default platform status (enabled)
INSERT INTO platform_status (is_enabled, disabled_reason)
VALUES (true, NULL)
ON CONFLICT DO NOTHING;

-- Create platform_status_log for audit trail
CREATE TABLE IF NOT EXISTS platform_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'enabled', 'disabled', 'auto_disabled', 'payment_received'
  performed_by TEXT NOT NULL,
  reason TEXT,
  previous_status BOOLEAN,
  new_status BOOLEAN,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_status_log_created_at 
ON platform_status_log(created_at DESC);

-- Function to update platform status
CREATE OR REPLACE FUNCTION update_platform_status(
  p_is_enabled BOOLEAN,
  p_reason TEXT,
  p_performed_by TEXT,
  p_auto_disabled BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  v_current_status BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get current status
  SELECT is_enabled INTO v_current_status FROM platform_status LIMIT 1;
  
  -- Update status
  UPDATE platform_status SET
    is_enabled = p_is_enabled,
    disabled_reason = CASE WHEN p_is_enabled THEN NULL ELSE p_reason END,
    disabled_by = CASE WHEN p_is_enabled THEN NULL ELSE p_performed_by END,
    disabled_at = CASE WHEN p_is_enabled THEN NULL ELSE NOW() END,
    auto_disabled = CASE WHEN p_is_enabled THEN false ELSE p_auto_disabled END,
    updated_at = NOW();
  
  -- Log the change
  INSERT INTO platform_status_log (action, performed_by, reason, previous_status, new_status)
  VALUES (
    CASE 
      WHEN p_is_enabled THEN 'enabled'
      WHEN p_auto_disabled THEN 'auto_disabled'
      ELSE 'disabled'
    END,
    p_performed_by,
    p_reason,
    v_current_status,
    p_is_enabled
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'previous_status', v_current_status,
    'new_status', p_is_enabled
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check and auto-disable if payment overdue
CREATE OR REPLACE FUNCTION check_payment_status() RETURNS JSONB AS $$
DECLARE
  v_payment_due_date DATE;
  v_payment_received_at TIMESTAMPTZ;
  v_is_enabled BOOLEAN;
  v_overdue_days INTEGER;
  v_result JSONB;
BEGIN
  SELECT payment_due_date, payment_received_at, is_enabled
  INTO v_payment_due_date, v_payment_received_at, v_is_enabled
  FROM platform_status LIMIT 1;
  
  -- If no due date set, platform is fine
  IF v_payment_due_date IS NULL THEN
    RETURN jsonb_build_object('status', 'ok', 'message', 'No payment due date set');
  END IF;
  
  -- If payment received after due date, platform is fine
  IF v_payment_received_at IS NOT NULL AND v_payment_received_at::date >= v_payment_due_date THEN
    RETURN jsonb_build_object('status', 'ok', 'message', 'Payment received');
  END IF;
  
  -- Calculate overdue days
  v_overdue_days := CURRENT_DATE - v_payment_due_date;
  
  -- Update overdue days
  UPDATE platform_status SET 
    payment_overdue_days = GREATEST(0, v_overdue_days),
    last_checked_at = NOW();
  
  -- If 5+ days overdue and still enabled, auto-disable
  IF v_overdue_days >= 5 AND v_is_enabled THEN
    PERFORM update_platform_status(
      false,
      'Automatically disabled due to payment overdue by ' || v_overdue_days || ' days',
      'system',
      true
    );
    
    RETURN jsonb_build_object(
      'status', 'auto_disabled',
      'overdue_days', v_overdue_days,
      'message', 'Platform auto-disabled due to payment overdue'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', CASE WHEN v_overdue_days > 0 THEN 'overdue' ELSE 'ok' END,
    'overdue_days', GREATEST(0, v_overdue_days)
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (service role bypasses, but good to have)
ALTER TABLE platform_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_status_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Allow read platform_status" ON platform_status;
DROP POLICY IF EXISTS "Allow all for service role" ON platform_status;
DROP POLICY IF EXISTS "Allow read platform_status_log" ON platform_status_log;
DROP POLICY IF EXISTS "Allow all for service role on log" ON platform_status_log;

-- Allow read access to authenticated users for platform_status
CREATE POLICY "Allow read platform_status" ON platform_status
  FOR SELECT TO authenticated USING (true);

-- Only service role can modify platform_status (enforced at API level)
CREATE POLICY "Allow all for service role" ON platform_status
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow read platform_status_log" ON platform_status_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for service role on log" ON platform_status_log
  FOR ALL TO service_role USING (true);

-- Grant permissions
GRANT SELECT ON platform_status TO authenticated;
GRANT SELECT ON platform_status_log TO authenticated;
GRANT ALL ON platform_status TO service_role;
GRANT ALL ON platform_status_log TO service_role;
