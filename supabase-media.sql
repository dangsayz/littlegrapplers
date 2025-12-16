-- ================================================
-- Media Attachments for Discussion Threads & Replies
-- Run this in your Supabase SQL Editor
-- ================================================

-- Create media_attachments table
CREATE TABLE IF NOT EXISTS media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_name TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  thumbnail_url TEXT, -- for videos
  width INTEGER, -- for images/videos
  height INTEGER, -- for images/videos
  duration INTEGER, -- for videos (in seconds)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Either thread_id OR reply_id must be set, not both
  CONSTRAINT media_parent_check CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_attachments_thread_id ON media_attachments(thread_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_reply_id ON media_attachments(reply_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_uploader_id ON media_attachments(uploader_id);

-- Enable RLS
ALTER TABLE media_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can view media attachments" ON media_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert media" ON media_attachments;
DROP POLICY IF EXISTS "Users can delete own media" ON media_attachments;

-- RLS Policies for media_attachments
CREATE POLICY "Anyone can view media attachments" 
  ON media_attachments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert media" 
  ON media_attachments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete own media" 
  ON media_attachments FOR DELETE 
  USING (uploader_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- ================================================
-- Storage bucket for media files (run separately if needed)
-- ================================================
-- In Supabase Dashboard > Storage, create a bucket called 'discussion-media'
-- Set it to public or configure appropriate policies

-- Grant service role access (for server-side uploads)
-- This is typically done automatically, but included for reference

COMMENT ON TABLE media_attachments IS 'Stores metadata for photos/videos attached to discussion threads and replies';
