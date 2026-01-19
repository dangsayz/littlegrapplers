-- ================================================
-- Missing Tables Migration
-- Run this in Supabase SQL Editor
-- These tables are referenced in code but were missing migrations
-- ================================================

-- ============================================
-- Media Table (for admin-uploaded media)
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size INTEGER,
  mime_type TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  all_locations BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on media"
  ON media FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Media Locations (join table for media-location assignments)
-- ============================================
CREATE TABLE IF NOT EXISTS media_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_media_locations_media ON media_locations(media_id);
CREATE INDEX IF NOT EXISTS idx_media_locations_location ON media_locations(location_id);

ALTER TABLE media_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on media_locations"
  ON media_locations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Location Media (location-specific media view)
-- ============================================
CREATE TABLE IF NOT EXISTS location_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  uploaded_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_media_location ON location_media(location_id);

ALTER TABLE location_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on location_media"
  ON location_media FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Work Orders (for dev task tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  quoted_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_by TEXT,
  assigned_to TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on work_orders"
  ON work_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Work Order Comments
-- ============================================
CREATE TABLE IF NOT EXISTS work_order_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_order_comments_order ON work_order_comments(work_order_id);

ALTER TABLE work_order_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on work_order_comments"
  ON work_order_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Admin Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_email ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on admin_audit_log"
  ON admin_audit_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- QA Mesh Results (for autonomous QA system)
-- ============================================
CREATE TABLE IF NOT EXISTS qa_mesh_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passed BOOLEAN NOT NULL,
  confidence DECIMAL(3,2),
  layer_results JSONB,
  issues_found INTEGER DEFAULT 0,
  issues_resolved INTEGER DEFAULT 0,
  report JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_mesh_results_created ON qa_mesh_results(created_at);

ALTER TABLE qa_mesh_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on qa_mesh_results"
  ON qa_mesh_results FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Update triggers for updated_at columns
-- ============================================
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_order_comments_updated_at BEFORE UPDATE ON work_order_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE media IS 'Admin-uploaded media files (photos, videos)';
COMMENT ON TABLE media_locations IS 'Join table for media-location assignments';
COMMENT ON TABLE location_media IS 'Location-specific media uploads';
COMMENT ON TABLE work_orders IS 'Dev task/work order tracking';
COMMENT ON TABLE work_order_comments IS 'Comments on work orders';
COMMENT ON TABLE admin_audit_log IS 'Audit trail for admin actions';
COMMENT ON TABLE qa_mesh_results IS 'Results from QA validation mesh runs';
