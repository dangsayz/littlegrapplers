-- Migration: Migrate existing signed_waivers to enrollments table
-- Run this in Supabase SQL Editor AFTER the enrollments table is created
-- This migrates historical waiver data to the new unified enrollment system

-- Step 0: Drop constraint that requires student_id for active enrollments
-- (We're grandfathering existing data without creating student records)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS approved_must_have_student;

-- Step 1: Migrate existing signed_waivers to enrollments
-- All existing waivers are grandfathered as 'active' status
INSERT INTO enrollments (
  location_id,
  status,
  guardian_first_name,
  guardian_last_name,
  guardian_email,
  guardian_phone,
  child_first_name,
  child_last_name,
  child_date_of_birth,
  emergency_contact_name,
  emergency_contact_phone,
  plan_type,
  digital_signature,
  photo_media_consent,
  waiver_agreed_at,
  waiver_ip_address,
  clerk_user_id,
  user_id,
  submitted_at,
  reviewed_at
)
SELECT 
  sw.location_id,
  'active' as status,
  -- Split guardian_full_name into first/last (take first word as first name, rest as last name)
  COALESCE(split_part(sw.guardian_full_name, ' ', 1), 'Unknown') as guardian_first_name,
  COALESCE(
    CASE 
      WHEN position(' ' in sw.guardian_full_name) > 0 
      THEN substring(sw.guardian_full_name from position(' ' in sw.guardian_full_name) + 1)
      ELSE ''
    END, 
    ''
  ) as guardian_last_name,
  sw.guardian_email,
  sw.guardian_phone,
  -- Split child_full_name into first/last
  COALESCE(split_part(sw.child_full_name, ' ', 1), 'Unknown') as child_first_name,
  COALESCE(
    CASE 
      WHEN position(' ' in sw.child_full_name) > 0 
      THEN substring(sw.child_full_name from position(' ' in sw.child_full_name) + 1)
      ELSE ''
    END, 
    ''
  ) as child_last_name,
  sw.child_date_of_birth,
  sw.emergency_contact_name,
  sw.emergency_contact_phone,
  'month-to-month' as plan_type,
  sw.digital_signature,
  COALESCE(sw.photo_media_consent, false),
  COALESCE(sw.signed_at, sw.created_at),
  sw.ip_address,
  sw.clerk_user_id,
  sw.user_id,
  COALESCE(sw.signed_at, sw.created_at),
  COALESCE(sw.signed_at, sw.created_at) -- Auto-approved since they're existing
FROM signed_waivers sw
WHERE sw.location_id IS NOT NULL
  AND NOT EXISTS (
    -- Avoid duplicates: check if enrollment already exists for this email + child + location
    SELECT 1 FROM enrollments e 
    WHERE e.guardian_email = sw.guardian_email 
      AND e.child_first_name = split_part(sw.child_full_name, ' ', 1)
      AND e.location_id = sw.location_id
  );

-- Step 2: For waivers without location_id, try to assign based on any pattern or leave null
-- These will need manual review
INSERT INTO enrollments (
  location_id,
  status,
  guardian_first_name,
  guardian_last_name,
  guardian_email,
  guardian_phone,
  child_first_name,
  child_last_name,
  child_date_of_birth,
  emergency_contact_name,
  emergency_contact_phone,
  plan_type,
  digital_signature,
  photo_media_consent,
  waiver_agreed_at,
  waiver_ip_address,
  clerk_user_id,
  user_id,
  submitted_at,
  reviewed_at
)
SELECT 
  (SELECT id FROM locations WHERE is_active = true ORDER BY name LIMIT 1), -- Default to first active location
  'active' as status,
  COALESCE(split_part(sw.guardian_full_name, ' ', 1), 'Unknown') as guardian_first_name,
  COALESCE(
    CASE 
      WHEN position(' ' in sw.guardian_full_name) > 0 
      THEN substring(sw.guardian_full_name from position(' ' in sw.guardian_full_name) + 1)
      ELSE ''
    END, 
    ''
  ) as guardian_last_name,
  sw.guardian_email,
  sw.guardian_phone,
  COALESCE(split_part(sw.child_full_name, ' ', 1), 'Unknown') as child_first_name,
  COALESCE(
    CASE 
      WHEN position(' ' in sw.child_full_name) > 0 
      THEN substring(sw.child_full_name from position(' ' in sw.child_full_name) + 1)
      ELSE ''
    END, 
    ''
  ) as child_last_name,
  sw.child_date_of_birth,
  sw.emergency_contact_name,
  sw.emergency_contact_phone,
  'month-to-month' as plan_type,
  sw.digital_signature,
  COALESCE(sw.photo_media_consent, false),
  COALESCE(sw.signed_at, sw.created_at),
  sw.ip_address,
  sw.clerk_user_id,
  sw.user_id,
  COALESCE(sw.signed_at, sw.created_at),
  COALESCE(sw.signed_at, sw.created_at)
FROM signed_waivers sw
WHERE sw.location_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.guardian_email = sw.guardian_email 
      AND e.child_first_name = split_part(sw.child_full_name, ' ', 1)
  );

-- Step 3: Verify migration
SELECT 
  'signed_waivers' as source,
  COUNT(*) as count
FROM signed_waivers
UNION ALL
SELECT 
  'enrollments' as source,
  COUNT(*) as count
FROM enrollments;

-- Step 4: Create RLS policy for enrollments table
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on enrollments" ON enrollments;
CREATE POLICY "Service role full access on enrollments" 
  ON enrollments FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
