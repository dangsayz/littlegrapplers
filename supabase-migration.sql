-- Little Grapplers Platform Schema - MIGRATION
-- Run this SQL in your Supabase SQL Editor
-- Version 2.0 - Safe migration for existing database

-- ============================================
-- STEP 1: Create NEW tables first
-- ============================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (registered platform users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  notes TEXT,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Add new columns to EXISTING tables
-- ============================================

-- Add columns to locations table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'pin_updated_at') THEN
    ALTER TABLE locations ADD COLUMN pin_updated_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'locations' AND column_name = 'pin_updated_by') THEN
    ALTER TABLE locations ADD COLUMN pin_updated_by UUID;
  END IF;
END $$;

-- Add columns to discussion_threads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'author_id') THEN
    ALTER TABLE discussion_threads ADD COLUMN author_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'is_hidden') THEN
    ALTER TABLE discussion_threads ADD COLUMN is_hidden BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'hidden_by') THEN
    ALTER TABLE discussion_threads ADD COLUMN hidden_by UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'hidden_at') THEN
    ALTER TABLE discussion_threads ADD COLUMN hidden_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'hidden_reason') THEN
    ALTER TABLE discussion_threads ADD COLUMN hidden_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'edit_count') THEN
    ALTER TABLE discussion_threads ADD COLUMN edit_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'last_edited_at') THEN
    ALTER TABLE discussion_threads ADD COLUMN last_edited_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_threads' AND column_name = 'last_edited_by') THEN
    ALTER TABLE discussion_threads ADD COLUMN last_edited_by UUID;
  END IF;
END $$;

-- Add columns to discussion_replies table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'author_id') THEN
    ALTER TABLE discussion_replies ADD COLUMN author_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'is_hidden') THEN
    ALTER TABLE discussion_replies ADD COLUMN is_hidden BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'hidden_by') THEN
    ALTER TABLE discussion_replies ADD COLUMN hidden_by UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'hidden_at') THEN
    ALTER TABLE discussion_replies ADD COLUMN hidden_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'hidden_reason') THEN
    ALTER TABLE discussion_replies ADD COLUMN hidden_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'edit_count') THEN
    ALTER TABLE discussion_replies ADD COLUMN edit_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'last_edited_at') THEN
    ALTER TABLE discussion_replies ADD COLUMN last_edited_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'last_edited_by') THEN
    ALTER TABLE discussion_replies ADD COLUMN last_edited_by UUID;
  END IF;
END $$;

-- ============================================
-- STEP 3: Create remaining NEW tables
-- ============================================

-- User location memberships
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- Content Reports (flagged content)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('thread', 'reply')),
  content_id UUID NOT NULL,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'off_topic', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables TEXT[],
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'welcome', 'announcement', 'promotion', 'reminder', 'transactional')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_id UUID REFERENCES email_templates(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  recipient_filter JSONB,
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  provider_message_id TEXT,
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES admin_users(id),
  notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: Indexes
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_locations_user ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_location ON user_locations(location_id);

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_clerk_id ON admin_users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Discussion indexes (new columns)
CREATE INDEX IF NOT EXISTS idx_discussion_threads_author ON discussion_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_hidden ON discussion_threads(is_hidden);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_hidden ON discussion_replies(is_hidden);

-- Content reports indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_type ON content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);

-- Email system indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_archived ON contact_submissions(is_archived);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Site settings index
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- ============================================
-- STEP 5: Enable RLS on new tables
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: RLS Policies (allow service role full access)
-- ============================================

-- Drop existing policies if they exist, then create new ones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Service role full access on admin_users" ON admin_users;
  DROP POLICY IF EXISTS "Service role full access on users" ON users;
  DROP POLICY IF EXISTS "Service role full access on user_locations" ON user_locations;
  DROP POLICY IF EXISTS "Service role full access on content_reports" ON content_reports;
  DROP POLICY IF EXISTS "Service role full access on email_templates" ON email_templates;
  DROP POLICY IF EXISTS "Service role full access on email_campaigns" ON email_campaigns;
  DROP POLICY IF EXISTS "Service role full access on email_logs" ON email_logs;
  DROP POLICY IF EXISTS "Service role full access on contact_submissions" ON contact_submissions;
  DROP POLICY IF EXISTS "Service role full access on activity_logs" ON activity_logs;
  DROP POLICY IF EXISTS "Service role full access on site_settings" ON site_settings;
END $$;

CREATE POLICY "Service role full access on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on user_locations" ON user_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on content_reports" ON content_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on email_templates" ON email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on email_campaigns" ON email_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on email_logs" ON email_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on contact_submissions" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 7: Seed default data
-- ============================================

-- Default Email Templates
INSERT INTO email_templates (name, slug, subject, body_html, variables, category)
VALUES 
  (
    'Welcome Email',
    'welcome',
    'Welcome to Little Grapplers, {{first_name}}!',
    '<h1>Welcome to Little Grapplers!</h1><p>Hi {{first_name}},</p><p>We''re excited to have you join our community at {{location_name}}.</p><p>Best regards,<br>Little Grapplers Team</p>',
    ARRAY['first_name', 'location_name'],
    'welcome'
  ),
  (
    'Announcement',
    'announcement',
    '{{subject}}',
    '<h1>{{title}}</h1><p>{{content}}</p><p>Best regards,<br>Little Grapplers Team</p>',
    ARRAY['subject', 'title', 'content'],
    'announcement'
  ),
  (
    'PIN Updated',
    'pin-updated',
    'Your Community Access PIN Has Been Updated',
    '<h1>New Community PIN</h1><p>Hi {{first_name}},</p><p>The access PIN for {{location_name}} has been updated.</p><p>Your new PIN is: <strong>{{pin}}</strong></p><p>Use this PIN to access the community discussion board.</p><p>Best regards,<br>Little Grapplers Team</p>',
    ARRAY['first_name', 'location_name', 'pin'],
    'transactional'
  )
ON CONFLICT (slug) DO NOTHING;

-- Default Site Settings
INSERT INTO site_settings (key, value, description)
VALUES 
  ('email_provider', '"resend"', 'Email service provider (resend, sendgrid)'),
  ('email_from_address', '"hello@littlegrapplers.com"', 'Default from email address'),
  ('email_from_name', '"Little Grapplers"', 'Default from name'),
  ('auto_suspend_after_reports', '3', 'Number of reports before auto-suspending content'),
  ('pin_expiry_days', '30', 'Number of days before PIN access expires')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STEP 8: Helper Functions & Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Migration complete.
-- ============================================
