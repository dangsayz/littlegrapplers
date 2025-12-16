-- Little Grapplers Subscriptions Schema
-- Run this in Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to user
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    clerk_user_id TEXT NOT NULL,
    
    -- Stripe data
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    
    -- Plan info
    plan_id TEXT NOT NULL, -- 'monthly' or 'threeMonth'
    plan_name TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, canceled, past_due, expired
    
    -- Dates
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT
    USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Policy: Allow service role to manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add location_id to signed_waivers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signed_waivers' AND column_name = 'location_id'
    ) THEN
        ALTER TABLE signed_waivers ADD COLUMN location_id UUID REFERENCES locations(id);
    END IF;
END $$;
