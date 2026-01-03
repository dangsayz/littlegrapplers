-- Little Grapplers Waiver Storage Schema
-- Run this in Supabase SQL Editor

-- Create signed_waivers table (linked to user accounts)
CREATE TABLE IF NOT EXISTS signed_waivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to user account
    user_id UUID,
    clerk_user_id TEXT NOT NULL UNIQUE,
    
    -- Guardian Information
    guardian_full_name TEXT NOT NULL,
    guardian_email TEXT NOT NULL,
    guardian_phone TEXT,
    
    -- Child Information
    child_full_name TEXT NOT NULL,
    child_date_of_birth DATE,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Signature and Consent
    digital_signature TEXT NOT NULL,
    photo_media_consent BOOLEAN DEFAULT false,
    agreed_to_terms BOOLEAN NOT NULL DEFAULT true,
    
    -- IP and Timestamp for legal purposes
    ip_address TEXT,
    user_agent TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_signed_waivers_user_id ON signed_waivers(user_id);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_clerk_user_id ON signed_waivers(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_email ON signed_waivers(guardian_email);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_signed_at ON signed_waivers(signed_at);

-- Enable RLS
ALTER TABLE signed_waivers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from authenticated and anonymous users (for public form submission)
CREATE POLICY "Allow public waiver submissions" ON signed_waivers
    FOR INSERT
    WITH CHECK (true);

-- Policy: Only allow specific admin emails to view waivers
CREATE POLICY "Allow admin to view waivers" ON signed_waivers
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' IN ('dangzr1@gmail.com', 'info@littlegrapplers.net')
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_signed_waivers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_signed_waivers_updated_at ON signed_waivers;
CREATE TRIGGER trigger_update_signed_waivers_updated_at
    BEFORE UPDATE ON signed_waivers
    FOR EACH ROW
    EXECUTE FUNCTION update_signed_waivers_updated_at();

-- Grant permissions for anonymous access (for public form)
GRANT INSERT ON signed_waivers TO anon;
GRANT INSERT ON signed_waivers TO authenticated;
