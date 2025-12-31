-- Fix for student removal - Add missing columns to signed_waivers
-- Run this in Supabase SQL Editor

-- Add soft delete columns to signed_waivers (if not already added)
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- Create index for filtering active students
CREATE INDEX IF NOT EXISTS idx_signed_waivers_active ON signed_waivers(is_active);

-- Update existing records to have is_active = true
UPDATE signed_waivers SET is_active = true WHERE is_active IS NULL;
