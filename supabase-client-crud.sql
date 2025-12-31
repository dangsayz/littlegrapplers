-- Little Grapplers - Client CRUD & Membership Requests Schema
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- PARENT ADDRESSES (linked to parents table)
-- ============================================
CREATE TABLE IF NOT EXISTS parent_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID UNIQUE NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEMBERSHIP REQUESTS (cancellation, pause, change)
-- ============================================
CREATE TABLE IF NOT EXISTS membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who made the request
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  
  -- What subscription/student this relates to
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  
  -- Request type and details
  request_type TEXT NOT NULL CHECK (request_type IN ('cancel', 'pause', 'resume', 'change_plan', 'remove_student')),
  
  -- For pause requests
  pause_start_date DATE,
  pause_end_date DATE,
  
  -- For plan changes
  current_plan TEXT,
  requested_plan TEXT,
  
  -- Reason and feedback
  reason TEXT NOT NULL,
  additional_comments TEXT,
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed', 'withdrawn')),
  
  -- Admin processing
  processed_by UUID REFERENCES admin_users(id),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  denial_reason TEXT,
  
  -- Effective date (when the action should take effect)
  effective_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD SOFT DELETE COLUMNS TO STUDENTS
-- ============================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE students ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS deactivated_by_parent BOOLEAN DEFAULT false;

-- ============================================
-- ADD SOFT DELETE COLUMNS TO SIGNED_WAIVERS
-- (since students are currently tracked via waivers)
-- ============================================
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE signed_waivers ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- ============================================
-- ADMIN NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What triggered the notification
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'membership_cancel_request',
    'membership_pause_request',
    'membership_change_request',
    'student_removal_request',
    'profile_update',
    'new_signup',
    'waiver_signed'
  )),
  
  -- Related entities
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES membership_requests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_by UUID REFERENCES admin_users(id),
  read_at TIMESTAMPTZ,
  
  -- Priority (for sorting)
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parent_addresses_parent ON parent_addresses(parent_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_user ON membership_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_type ON membership_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_membership_requests_created ON membership_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_active ON signed_waivers(is_active);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE parent_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Service role full access on parent_addresses" ON parent_addresses;
DROP POLICY IF EXISTS "Service role full access on membership_requests" ON membership_requests;
DROP POLICY IF EXISTS "Service role full access on admin_notifications" ON admin_notifications;

CREATE POLICY "Service role full access on parent_addresses" ON parent_addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on membership_requests" ON membership_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on admin_notifications" ON admin_notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_parent_addresses_updated_at ON parent_addresses;
DROP TRIGGER IF EXISTS update_membership_requests_updated_at ON membership_requests;

CREATE TRIGGER update_parent_addresses_updated_at BEFORE UPDATE ON parent_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_requests_updated_at BEFORE UPDATE ON membership_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PREDEFINED CANCELLATION REASONS (for dropdowns)
-- ============================================
CREATE TABLE IF NOT EXISTS cancellation_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO cancellation_reasons (reason, sort_order) VALUES
  ('Moving to a different area', 1),
  ('Financial reasons', 2),
  ('Schedule conflicts', 3),
  ('Child lost interest', 4),
  ('Trying a different activity', 5),
  ('Medical reasons', 6),
  ('Seasonal break (will return)', 7),
  ('Other', 99)
ON CONFLICT DO NOTHING;

ALTER TABLE cancellation_reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on cancellation_reasons" ON cancellation_reasons FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONE!
-- ============================================
