-- Feature Modules System
-- Allows Super Admins to toggle individual platform features on/off

-- Create feature_modules table
CREATE TABLE IF NOT EXISTS feature_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_message TEXT,
  disabled_by TEXT,
  disabled_at TIMESTAMPTZ,
  icon TEXT, -- Lucide icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default feature modules
INSERT INTO feature_modules (module_key, name, description, category, is_enabled, icon, sort_order) VALUES
  ('revenue_intelligence', 'Revenue Intelligence', 'Financial dashboard, Stripe integration, revenue metrics', 'admin', true, 'TrendingUp', 1),
  ('community_boards', 'Community Boards', 'Discussion forums and community features per location', 'community', true, 'MessageSquare', 2),
  ('video_media', 'Video + Images', 'Media library, video content, image galleries', 'content', true, 'Video', 3),
  ('notifications', 'Notifications', 'Email notifications, push notifications, alerts', 'communication', true, 'Bell', 4),
  ('enrollments', 'Enrollments', 'Student enrollment management and processing', 'admin', true, 'UserPlus', 5),
  ('admin_panel', 'Admin Panel', 'Full admin dashboard access', 'admin', true, 'Settings', 6),
  ('my_students', 'My Students', 'Parent portal - view student progress and details', 'portal', true, 'Users', 7),
  ('locations', 'Multi-Location', 'Multi-location features and location management', 'admin', true, 'MapPin', 8),
  ('announcements', 'Announcements', 'Create and manage announcements', 'communication', true, 'Megaphone', 9),
  ('student_of_month', 'Student of the Month', 'Student recognition and awards features', 'content', true, 'Trophy', 10),
  ('waivers', 'Waivers', 'Digital waiver management and signing', 'admin', true, 'FileText', 11),
  ('memberships', 'Memberships', 'Membership plans and subscription management', 'admin', true, 'CreditCard', 12)
ON CONFLICT (module_key) DO NOTHING;

-- Create feature_module_logs for audit trail
CREATE TABLE IF NOT EXISTS feature_module_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL,
  action TEXT NOT NULL, -- 'enabled', 'disabled'
  performed_by TEXT NOT NULL,
  reason TEXT,
  previous_state BOOLEAN,
  new_state BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_modules_key ON feature_modules(module_key);
CREATE INDEX IF NOT EXISTS idx_feature_modules_enabled ON feature_modules(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_module_logs_created ON feature_module_logs(created_at DESC);

-- Function to toggle a feature module
CREATE OR REPLACE FUNCTION toggle_feature_module(
  p_module_key TEXT,
  p_is_enabled BOOLEAN,
  p_performed_by TEXT,
  p_reason TEXT DEFAULT NULL,
  p_disabled_message TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_current_state BOOLEAN;
  v_module_name TEXT;
  v_result JSONB;
BEGIN
  -- Get current state
  SELECT is_enabled, name INTO v_current_state, v_module_name 
  FROM feature_modules 
  WHERE module_key = p_module_key;
  
  IF v_module_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Module not found');
  END IF;
  
  -- Update module
  UPDATE feature_modules SET
    is_enabled = p_is_enabled,
    disabled_message = CASE WHEN p_is_enabled THEN NULL ELSE COALESCE(p_disabled_message, 'This feature is currently unavailable') END,
    disabled_by = CASE WHEN p_is_enabled THEN NULL ELSE p_performed_by END,
    disabled_at = CASE WHEN p_is_enabled THEN NULL ELSE NOW() END,
    updated_at = NOW()
  WHERE module_key = p_module_key;
  
  -- Log the change
  INSERT INTO feature_module_logs (module_key, action, performed_by, reason, previous_state, new_state)
  VALUES (
    p_module_key,
    CASE WHEN p_is_enabled THEN 'enabled' ELSE 'disabled' END,
    p_performed_by,
    p_reason,
    v_current_state,
    p_is_enabled
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'module_key', p_module_key,
    'module_name', v_module_name,
    'previous_state', v_current_state,
    'new_state', p_is_enabled
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get all modules status
CREATE OR REPLACE FUNCTION get_feature_modules_status()
RETURNS TABLE (
  module_key TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  is_enabled BOOLEAN,
  disabled_message TEXT,
  disabled_by TEXT,
  disabled_at TIMESTAMPTZ,
  icon TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fm.module_key,
    fm.name,
    fm.description,
    fm.category,
    fm.is_enabled,
    fm.disabled_message,
    fm.disabled_by,
    fm.disabled_at,
    fm.icon,
    fm.sort_order
  FROM feature_modules fm
  ORDER BY fm.sort_order;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE feature_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_module_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read feature_modules" ON feature_modules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for service role on feature_modules" ON feature_modules
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow read feature_module_logs" ON feature_module_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all for service role on feature_module_logs" ON feature_module_logs
  FOR ALL TO service_role USING (true);

-- Grant permissions
GRANT SELECT ON feature_modules TO authenticated;
GRANT SELECT ON feature_module_logs TO authenticated;
GRANT ALL ON feature_modules TO service_role;
GRANT ALL ON feature_module_logs TO service_role;
