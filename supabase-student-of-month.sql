-- Student of the Month feature
-- Run this in Supabase SQL Editor

-- Create student_of_month table to track monthly selections per location
CREATE TABLE IF NOT EXISTS student_of_month (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  month DATE NOT NULL, -- First day of the month (e.g., 2026-01-01 for January 2026)
  selected_by UUID REFERENCES admin_users(id),
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, month) -- Only one student per location per month
);

-- Enable RLS
ALTER TABLE student_of_month ENABLE ROW LEVEL SECURITY;

-- RLS Policy for service role
DROP POLICY IF EXISTS "Service role full access on student_of_month" ON student_of_month;
CREATE POLICY "Service role full access on student_of_month" 
  ON student_of_month FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_student_of_month_updated_at ON student_of_month;
CREATE TRIGGER update_student_of_month_updated_at 
  BEFORE UPDATE ON student_of_month
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_student_of_month_location ON student_of_month(location_id);
CREATE INDEX IF NOT EXISTS idx_student_of_month_month ON student_of_month(month);
