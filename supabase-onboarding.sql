-- Little Grapplers - Onboarding Tables Migration
-- Run this SQL in your Supabase SQL Editor after the main migration

-- ============================================
-- Add access_pin column to locations (if missing)
-- ============================================
ALTER TABLE locations ADD COLUMN IF NOT EXISTS access_pin TEXT;

-- ============================================
-- Parents Table (linked to users)
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
-- Students Table (linked to parents)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Student Locations (which location a student attends)
-- ============================================
CREATE TABLE IF NOT EXISTS student_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, location_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_student_locations_student ON student_locations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_locations_location ON student_locations(location_id);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_locations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Service role full access on parents" ON parents;
DROP POLICY IF EXISTS "Service role full access on students" ON students;
DROP POLICY IF EXISTS "Service role full access on student_locations" ON student_locations;

CREATE POLICY "Service role full access on parents" ON parents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_locations" ON student_locations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Triggers for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_parents_updated_at ON parents;
DROP TRIGGER IF EXISTS update_students_updated_at ON students;

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed locations (if not exists)
-- ============================================
INSERT INTO locations (name, slug, address, city, state, is_active)
SELECT 'Lionheart Central Church', 'lionheart-central-church', '123 Central Ave', 'Dallas', 'TX', true
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE slug = 'lionheart-central-church');

INSERT INTO locations (name, slug, address, city, state, is_active)
SELECT 'Lionheart First Baptist Plano', 'lionheart-first-baptist-plano', '456 First Baptist Way', 'Plano', 'TX', true
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE slug = 'lionheart-first-baptist-plano');

INSERT INTO locations (name, slug, address, city, state, is_active)
SELECT 'Pinnacle at Montessori', 'pinnacle-montessori', '789 Montessori Dr', 'Richardson', 'TX', true
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE slug = 'pinnacle-montessori');

-- ============================================
-- Discussion Threads Table
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Discussion Replies Table
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Discussion Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_threads_location ON discussion_threads(location_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON discussion_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_thread ON discussion_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_replies_author ON discussion_replies(author_id);

-- ============================================
-- Discussion RLS
-- ============================================
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on discussion_threads" ON discussion_threads;
DROP POLICY IF EXISTS "Service role full access on discussion_replies" ON discussion_replies;

CREATE POLICY "Service role full access on discussion_threads" ON discussion_threads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on discussion_replies" ON discussion_replies FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Discussion Triggers
-- ============================================
DROP TRIGGER IF EXISTS update_discussion_threads_updated_at ON discussion_threads;
DROP TRIGGER IF EXISTS update_discussion_replies_updated_at ON discussion_replies;

CREATE TRIGGER update_discussion_threads_updated_at BEFORE UPDATE ON discussion_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE!
-- ============================================
