-- Enrollments Table Schema
-- This table manages the enrollment workflow: waiver submission → admin review → student activation
-- Run this in Supabase SQL Editor to create the enrollments table

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location reference
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  
  -- Status workflow: pending → approved → active (or rejected/cancelled)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'rejected', 'cancelled')),
  
  -- Guardian information
  guardian_first_name TEXT NOT NULL,
  guardian_last_name TEXT NOT NULL,
  guardian_email TEXT NOT NULL,
  guardian_phone TEXT,
  
  -- Child information
  child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL,
  child_date_of_birth DATE,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Plan selection
  plan_type TEXT DEFAULT 'month-to-month',
  
  -- Waiver/consent information
  digital_signature TEXT NOT NULL,
  photo_media_consent BOOLEAN DEFAULT false,
  waiver_agreed_at TIMESTAMPTZ,
  waiver_ip_address TEXT,
  
  -- User linking (optional - for logged-in users)
  clerk_user_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Student linking (set when enrollment is approved/activated)
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Cancellation
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  -- Standard timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_location_id ON enrollments(location_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_clerk_user_id ON enrollments(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_guardian_email ON enrollments(guardian_email);
CREATE INDEX IF NOT EXISTS idx_enrollments_submitted_at ON enrollments(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_child_name ON enrollments(child_first_name, child_last_name);

-- Create composite index for duplicate checking
CREATE INDEX IF NOT EXISTS idx_enrollments_duplicate_check 
  ON enrollments(guardian_email, child_first_name, child_last_name, location_id);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role has full access
DROP POLICY IF EXISTS "Service role full access on enrollments" ON enrollments;
CREATE POLICY "Service role full access on enrollments" 
  ON enrollments FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Authenticated users can view their own enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" 
  ON enrollments FOR SELECT 
  TO authenticated 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Anyone can insert (public waiver form)
DROP POLICY IF EXISTS "Anyone can create enrollment" ON enrollments;
CREATE POLICY "Anyone can create enrollment" 
  ON enrollments FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON enrollments TO authenticated;
GRANT INSERT ON enrollments TO anon, authenticated;
GRANT ALL ON enrollments TO service_role;

-- Verification query (run after to confirm)
SELECT 
  'enrollments table created successfully' as status,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'enrollments';
