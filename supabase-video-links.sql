-- Add video_links column to discussion_threads table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE discussion_threads 
ADD COLUMN IF NOT EXISTS video_links TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN discussion_threads.video_links IS 'Array of YouTube/Vimeo URLs shared in the thread';
