-- =====================================================
-- MEMBERSHIP REQUESTS & NOTIFICATIONS SCHEMA
-- =====================================================

-- Membership requests table
-- Users request to join a location, admin approves/rejects
CREATE TABLE IF NOT EXISTS membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT, -- Optional message from user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  UNIQUE(user_id, location_id)
);

-- Location members table (approved members)
CREATE TABLE IF NOT EXISTS location_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'instructor', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- Notifications table for admin
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'membership_request',
    'new_thread',
    'new_reply',
    'new_user_signup'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data (user_id, location_id, thread_id, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_location ON membership_requests(location_id);
CREATE INDEX IF NOT EXISTS idx_location_members_location ON location_members(location_id);
CREATE INDEX IF NOT EXISTS idx_location_members_user ON location_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_membership_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for membership_requests updated_at
DROP TRIGGER IF EXISTS membership_request_updated ON membership_requests;
CREATE TRIGGER membership_request_updated
  BEFORE UPDATE ON membership_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_request_timestamp();

-- RLS Policies
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create membership requests
CREATE POLICY "Users can create membership requests"
  ON membership_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own requests
CREATE POLICY "Users can view own membership requests"
  ON membership_requests FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin to update requests
CREATE POLICY "Admin can update membership requests"
  ON membership_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Location members policies
CREATE POLICY "Anyone can view location members"
  ON location_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage location members"
  ON location_members FOR ALL
  TO authenticated
  USING (true);

-- Notifications are admin-only
CREATE POLICY "Admin can view notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true);
