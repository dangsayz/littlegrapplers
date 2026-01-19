-- ================================================
-- Media Comments Table
-- Run this in your Supabase SQL Editor
-- ================================================

-- Create media_comments table for nested comments on media items
CREATE TABLE IF NOT EXISTS media_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES media_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_comments_media_id ON media_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_parent_id ON media_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_location_id ON media_comments(location_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_user_email ON media_comments(user_email);

-- Enable RLS
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_comments
CREATE POLICY "Service role full access on media_comments"
  ON media_comments FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_media_comments_updated_at BEFORE UPDATE ON media_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE media_comments IS 'Stores comments on media items with support for nested replies via parent_id';
