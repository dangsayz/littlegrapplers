-- Add location_id column to signed_waivers table
-- Run this in Supabase SQL Editor

-- Add the location_id column
ALTER TABLE signed_waivers 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signed_waivers_location_id ON signed_waivers(location_id);
