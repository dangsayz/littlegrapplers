-- Balance Reminder System Migration
-- Adds support for balance reminders and payment expiration enforcement

-- Add balance reminder settings to platform_status
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS balance_reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS reminder_frequency TEXT DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'biweekly', 'monthly'));
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS next_reminder_scheduled_at TIMESTAMPTZ;
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS payment_expiration_date DATE;
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT 'info@littlegrapplers.net';
ALTER TABLE platform_status ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT 'Little Grapplers';

-- Balance reminder logs for tracking sent reminders
CREATE TABLE IF NOT EXISTS balance_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  amount_due DECIMAL(10,2) NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('manual', 'automated', 'final_warning')),
  expiration_date DATE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  email_provider_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_balance_reminder_logs_sent_at ON balance_reminder_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_reminder_logs_recipient ON balance_reminder_logs(recipient_email);

-- Function to calculate next reminder date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_reminder_date(
  p_frequency TEXT,
  p_last_sent TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE p_frequency
    WHEN 'daily' THEN p_last_sent + INTERVAL '1 day'
    WHEN 'weekly' THEN p_last_sent + INTERVAL '7 days'
    WHEN 'biweekly' THEN p_last_sent + INTERVAL '14 days'
    WHEN 'monthly' THEN p_last_sent + INTERVAL '30 days'
    ELSE p_last_sent + INTERVAL '7 days'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to update reminder schedule after sending
CREATE OR REPLACE FUNCTION update_reminder_schedule() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_reminder_sent_at IS DISTINCT FROM OLD.last_reminder_sent_at THEN
    NEW.next_reminder_scheduled_at := calculate_next_reminder_date(NEW.reminder_frequency, NEW.last_reminder_sent_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reminder_schedule_trigger ON platform_status;
CREATE TRIGGER update_reminder_schedule_trigger
  BEFORE UPDATE ON platform_status
  FOR EACH ROW
  EXECUTE FUNCTION update_reminder_schedule();

-- Function to check if platform should be disabled due to payment expiration
CREATE OR REPLACE FUNCTION check_payment_expiration() RETURNS JSONB AS $$
DECLARE
  v_expiration_date DATE;
  v_is_enabled BOOLEAN;
  v_days_overdue INTEGER;
  v_result JSONB;
BEGIN
  SELECT payment_expiration_date, is_enabled
  INTO v_expiration_date, v_is_enabled
  FROM platform_status LIMIT 1;
  
  -- If no expiration date set, platform is fine
  IF v_expiration_date IS NULL THEN
    RETURN jsonb_build_object('status', 'ok', 'message', 'No expiration date set');
  END IF;
  
  -- Calculate days overdue
  v_days_overdue := CURRENT_DATE - v_expiration_date;
  
  -- If expiration date has passed and still enabled, auto-disable
  IF v_days_overdue > 0 AND v_is_enabled THEN
    PERFORM update_platform_status(
      false,
      'Automatically disabled - payment expiration date passed (' || v_expiration_date || ')',
      'system',
      true
    );
    
    RETURN jsonb_build_object(
      'status', 'auto_disabled',
      'days_overdue', v_days_overdue,
      'expiration_date', v_expiration_date,
      'message', 'Platform auto-disabled due to payment expiration'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', CASE WHEN v_days_overdue > 0 THEN 'expired' ELSE 'ok' END,
    'days_until_expiration', -v_days_overdue,
    'expiration_date', v_expiration_date
  );
END;
$$ LANGUAGE plpgsql;

-- RLS for balance_reminder_logs
ALTER TABLE balance_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read balance_reminder_logs" ON balance_reminder_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for service role on reminder logs" ON balance_reminder_logs
  FOR ALL TO service_role USING (true);

GRANT SELECT ON balance_reminder_logs TO authenticated;
GRANT ALL ON balance_reminder_logs TO service_role;
