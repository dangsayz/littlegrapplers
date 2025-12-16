-- Little Grapplers Platform Schema
-- Run this SQL in your Supabase SQL Editor
-- Version 2.0 - Full Admin Dashboard Support

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Admin users table (for platform admins, separate from Clerk auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Links to Clerk user
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registered platform users (parents/members who signed up)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE, -- Links to Clerk user if they have an account
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  notes TEXT, -- Admin notes about the user
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User location memberships (which locations a user belongs to)
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- ============================================
-- Locations Table
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL DEFAULT 'TBD',
  city TEXT NOT NULL DEFAULT 'Dallas',
  state TEXT NOT NULL DEFAULT 'TX',
  zip TEXT NOT NULL DEFAULT '00000',
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  description TEXT,
  access_pin TEXT, -- PIN code for accessing community page (4-6 digits)
  pin_updated_at TIMESTAMPTZ, -- Track when PIN was last changed
  pin_updated_by UUID REFERENCES admin_users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Location PIN Access (tracks verified visitors)
-- ============================================
CREATE TABLE IF NOT EXISTS location_pin_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, visitor_id)
);

-- ============================================
-- Discussion Threads
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user if registered
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false, -- Admin can hide inappropriate content
  hidden_by UUID REFERENCES admin_users(id),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,
  edit_count INT DEFAULT 0,
  last_edited_at TIMESTAMPTZ,
  last_edited_by UUID REFERENCES admin_users(id), -- Track admin edits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Discussion Replies
-- ============================================
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user if registered
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false, -- Admin can hide inappropriate content
  hidden_by UUID REFERENCES admin_users(id),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,
  edit_count INT DEFAULT 0,
  last_edited_at TIMESTAMPTZ,
  last_edited_by UUID REFERENCES admin_users(id), -- Track admin edits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Content Reports (flagged content)
-- ============================================
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('thread', 'reply')),
  content_id UUID NOT NULL, -- thread_id or reply_id
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'off_topic', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL SYSTEM
-- ============================================

-- Email templates (reusable templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT, -- Plain text version
  variables TEXT[], -- Array of variable names like ['first_name', 'location_name']
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'welcome', 'announcement', 'promotion', 'reminder', 'transactional')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns (bulk emails)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_id UUID REFERENCES email_templates(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  recipient_filter JSONB, -- Filter criteria: {"locations": ["uuid"], "status": "active"}
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

-- Email logs (individual email records)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  provider_message_id TEXT, -- ID from email provider (Resend, SendGrid, etc.)
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Contact Submissions
-- ============================================
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
  notes TEXT, -- Admin notes
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Activity Log (Admin audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL, -- e.g., 'user.suspend', 'thread.delete', 'pin.update'
  entity_type TEXT NOT NULL, -- e.g., 'user', 'thread', 'location', 'email_campaign'
  entity_id UUID,
  details JSONB, -- Additional context about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Site Settings (key-value store for admin settings)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
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

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_location_pin_access_location ON location_pin_access(location_id);
CREATE INDEX IF NOT EXISTS idx_location_pin_access_expires ON location_pin_access(expires_at);

-- Discussion indexes
CREATE INDEX IF NOT EXISTS idx_discussion_threads_location ON discussion_threads(location_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_author ON discussion_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_pinned ON discussion_threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_hidden ON discussion_threads(is_hidden);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread ON discussion_replies(thread_id);
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
-- Seed the 3 locations
-- ============================================
INSERT INTO locations (name, slug, address, city, state, is_active)
VALUES 
  ('Lionheart Central Church', 'lionheart-central-church', '123 Central Ave', 'Dallas', 'TX', true),
  ('Lionheart First Baptist Plano', 'lionheart-first-baptist-plano', '456 First Baptist Way', 'Plano', 'TX', true),
  ('Pinnacle at Montessori', 'pinnacle-montessori', '789 Montessori Dr', 'Richardson', 'TX', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pin_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (Service role bypass for server-side operations)
-- ============================================

-- Admin users policies
CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Users policies
CREATE POLICY "Service role full access on users"
  ON users FOR ALL USING (true) WITH CHECK (true);

-- User locations policies
CREATE POLICY "Service role full access on user_locations"
  ON user_locations FOR ALL USING (true) WITH CHECK (true);

-- Locations policies
CREATE POLICY "Service role full access on locations"
  ON locations FOR ALL USING (true) WITH CHECK (true);

-- Location PIN access policies
CREATE POLICY "Service role full access on location_pin_access"
  ON location_pin_access FOR ALL USING (true) WITH CHECK (true);

-- Discussion threads policies
CREATE POLICY "Service role full access on discussion_threads"
  ON discussion_threads FOR ALL USING (true) WITH CHECK (true);

-- Discussion replies policies
CREATE POLICY "Service role full access on discussion_replies"
  ON discussion_replies FOR ALL USING (true) WITH CHECK (true);

-- Content reports policies
CREATE POLICY "Service role full access on content_reports"
  ON content_reports FOR ALL USING (true) WITH CHECK (true);

-- Email templates policies
CREATE POLICY "Service role full access on email_templates"
  ON email_templates FOR ALL USING (true) WITH CHECK (true);

-- Email campaigns policies
CREATE POLICY "Service role full access on email_campaigns"
  ON email_campaigns FOR ALL USING (true) WITH CHECK (true);

-- Email logs policies
CREATE POLICY "Service role full access on email_logs"
  ON email_logs FOR ALL USING (true) WITH CHECK (true);

-- Contact submissions policies
CREATE POLICY "Service role full access on contact_submissions"
  ON contact_submissions FOR ALL USING (true) WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Service role full access on activity_logs"
  ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Site settings policies
CREATE POLICY "Service role full access on site_settings"
  ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Default Email Templates
-- ============================================
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

-- ============================================
-- Default Site Settings
-- ============================================
INSERT INTO site_settings (key, value, description)
VALUES 
  ('email_provider', '"resend"', 'Email service provider (resend, sendgrid)'),
  ('email_from_address', '"hello@littlegrapplers.com"', 'Default from email address'),
  ('email_from_name', '"Little Grapplers"', 'Default from name'),
  ('auto_suspend_after_reports', '3', 'Number of reports before auto-suspending content'),
  ('pin_expiry_days', '30', 'Number of days before PIN access expires')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_threads_updated_at BEFORE UPDATE ON discussion_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
