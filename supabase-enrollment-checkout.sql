-- Migration for unified enrollment checkout flow
-- Run this in Supabase SQL Editor

-- Add enrollment_id to subscriptions table for linking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES enrollments(id);

-- Make clerk_user_id nullable (for unauthenticated enrollments)
ALTER TABLE subscriptions ALTER COLUMN clerk_user_id DROP NOT NULL;

-- Add stripe_checkout_session_id to enrollments for tracking
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Add pending_payment status to enrollments
-- (This is just documentation - the status column already accepts any text)

-- Create index for enrollment lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_enrollment_id ON subscriptions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_checkout_session_id ON enrollments(stripe_checkout_session_id);

-- Update subscriptions to allow null clerk_user_id for public enrollments
COMMENT ON COLUMN subscriptions.clerk_user_id IS 'Clerk user ID - NULL for public enrollments before account creation';
COMMENT ON COLUMN subscriptions.enrollment_id IS 'Link to enrollment record for unified checkout flow';
