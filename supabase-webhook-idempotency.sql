-- Webhook Event Idempotency Table
-- Prevents double-processing of Stripe webhook events
-- Run this in Supabase SQL Editor

-- Create webhook_events table for tracking processed events
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);

-- Create index for cleanup queries (old events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- RLS: Only service role can access this table
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No public access - only service role key can read/write
-- This is intentional as webhooks use the service role key

-- Optional: Auto-cleanup old events (older than 30 days)
-- This prevents the table from growing indefinitely
-- Run as a scheduled function or cron job:
-- DELETE FROM webhook_events WHERE processed_at < NOW() - INTERVAL '30 days';

COMMENT ON TABLE webhook_events IS 'Tracks processed Stripe webhook events for idempotency';
COMMENT ON COLUMN webhook_events.stripe_event_id IS 'Stripe event ID (evt_xxx) - unique to prevent duplicate processing';
COMMENT ON COLUMN webhook_events.event_type IS 'Stripe event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN webhook_events.processed_at IS 'When the event was successfully processed';
