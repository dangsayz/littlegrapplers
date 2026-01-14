-- Little Grapplers - Verify Onboarding Tables
-- Run this in Supabase SQL Editor to ensure all required tables exist
-- This is a diagnostic + fix script for onboarding failures

-- ============================================
-- 1. Check if parents table exists, create if not
-- ============================================
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  how_heard TEXT,
  photo_consent BOOLEAN DEFAULT false,
  waiver_accepted BOOLEAN DEFAULT false,
  waiver_accepted_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Check if students table exists, create if not
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  belt_rank TEXT DEFAULT 'white',
  stripes INT DEFAULT 0,
  medical_conditions TEXT,
  tshirt_size TEXT,
  avatar_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_active column if missing (for soft deletes)
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- 3. Check if student_locations table exists
-- ============================================
CREATE TABLE IF NOT EXISTS student_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, location_id)
);

-- ============================================
-- 4. Ensure user_locations table exists
-- ============================================
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- ============================================
-- 5. Add location_id to signed_waivers if missing
-- ============================================
ALTER TABLE signed_waivers 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- ============================================
-- 6. Make clerk_user_id nullable in signed_waivers
-- (some users may not have clerk accounts yet)
-- ============================================
ALTER TABLE signed_waivers ALTER COLUMN clerk_user_id DROP NOT NULL;

-- Drop unique constraint if it exists (allows multiple waivers per user)
ALTER TABLE signed_waivers DROP CONSTRAINT IF EXISTS signed_waivers_clerk_user_id_key;

-- ============================================
-- 6.5 Add missing columns to signed_waivers for student profile editing
-- ============================================
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS child_gender TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- ============================================
-- 7. Ensure activity_logs table exists
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. Enable RLS on all tables
-- ============================================
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. Create permissive policies for service role
-- ============================================
DO $$ 
BEGIN
  -- Parents
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Service role full access on parents') THEN
    CREATE POLICY "Service role full access on parents" ON parents FOR ALL USING (true) WITH CHECK (true);
  END IF;
  
  -- Students
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Service role full access on students') THEN
    CREATE POLICY "Service role full access on students" ON students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  
  -- Student locations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_locations' AND policyname = 'Service role full access on student_locations') THEN
    CREATE POLICY "Service role full access on student_locations" ON student_locations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  
  -- User locations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_locations' AND policyname = 'Service role full access on user_locations') THEN
    CREATE POLICY "Service role full access on user_locations" ON user_locations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  
  -- Activity logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Service role full access on activity_logs') THEN
    CREATE POLICY "Service role full access on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 10. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_student_locations_student ON student_locations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_locations_location ON student_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_location ON user_locations(location_id);

-- ============================================
-- VERIFICATION QUERIES (Run these to check status)
-- ============================================

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('parents', 'students', 'student_locations', 'user_locations', 'activity_logs', 'signed_waivers');

-- Check signed_waivers columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'signed_waivers';

-- ============================================
-- DONE!
-- ============================================
