-- Email Events Tracking Migration
-- Tracks opens, clicks, deliveries, bounces from Resend webhooks

-- Email events table for tracking engagement
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_provider_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'delivery_delayed')),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  link_url TEXT,
  bounce_type TEXT,
  bounce_message TEXT,
  raw_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_events_recipient ON email_events(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_events_provider_id ON email_events(email_provider_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient_type ON email_events(recipient_email, event_type);

-- Add tracking columns to balance_reminder_logs if not exists
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ;
ALTER TABLE balance_reminder_logs ADD COLUMN IF NOT EXISTS bounce_reason TEXT;

-- Function to get email engagement summary for a recipient
CREATE OR REPLACE FUNCTION get_email_engagement_summary(p_email TEXT)
RETURNS TABLE (
  total_sent BIGINT,
  total_delivered BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  total_bounced BIGINT,
  first_email_at TIMESTAMPTZ,
  last_email_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  open_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'sent') AS total_sent,
    COUNT(*) FILTER (WHERE event_type = 'delivered') AS total_delivered,
    COUNT(*) FILTER (WHERE event_type = 'opened') AS total_opened,
    COUNT(*) FILTER (WHERE event_type = 'clicked') AS total_clicked,
    COUNT(*) FILTER (WHERE event_type = 'bounced') AS total_bounced,
    MIN(event_timestamp) FILTER (WHERE event_type = 'sent') AS first_email_at,
    MAX(event_timestamp) FILTER (WHERE event_type = 'sent') AS last_email_at,
    MAX(event_timestamp) FILTER (WHERE event_type = 'opened') AS last_opened_at,
    CASE 
      WHEN COUNT(*) FILTER (WHERE event_type = 'delivered') > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE event_type = 'opened')::NUMERIC / 
         COUNT(*) FILTER (WHERE event_type = 'delivered')::NUMERIC) * 100, 
        2
      )
      ELSE 0
    END AS open_rate
  FROM email_events
  WHERE recipient_email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed email activity for a recipient
CREATE OR REPLACE FUNCTION get_email_activity(
  p_email TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  email_provider_id TEXT,
  event_type TEXT,
  event_timestamp TIMESTAMPTZ,
  user_agent TEXT,
  ip_address TEXT,
  link_url TEXT,
  bounce_type TEXT,
  bounce_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.email_provider_id,
    e.event_type,
    e.event_timestamp,
    e.user_agent,
    e.ip_address,
    e.link_url,
    e.bounce_type,
    e.bounce_message
  FROM email_events e
  WHERE e.recipient_email = p_email
  ORDER BY e.event_timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read email_events for authenticated" ON email_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for service role on email_events" ON email_events
  FOR ALL TO service_role USING (true);

GRANT SELECT ON email_events TO authenticated;
GRANT ALL ON email_events TO service_role;
