-- Add notes column to signed_waivers table
-- Run this in Supabase SQL Editor

-- Add notes column for admin to track membership dates and other notes
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Also add these additional fields that the edit form expects but might be missing
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS child_gender TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS parent_first_name TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS parent_last_name TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS parent_address TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Migrate existing data to new columns (if guardian fields exist)
UPDATE signed_waivers 
SET 
  parent_first_name = SPLIT_PART(guardian_full_name, ' ', 1),
  parent_last_name = SUBSTRING(guardian_full_name FROM POSITION(' ' IN guardian_full_name) + 1),
  parent_email = guardian_email,
  parent_phone = guardian_phone
WHERE parent_first_name IS NULL AND guardian_full_name IS NOT NULL;
