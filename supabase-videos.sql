-- ================================================
-- Video Library Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Video categories
CREATE TABLE IF NOT EXISTS video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube/Vimeo embed URL or direct URL
  video_type TEXT NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'direct')),
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  category_id UUID REFERENCES video_categories(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false, -- Show on marketing site?
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video location access (which locations can see this video)
-- Empty means all locations can see it
CREATE TABLE IF NOT EXISTS video_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE(video_id, location_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_is_public ON videos(is_public);
CREATE INDEX IF NOT EXISTS idx_videos_sort_order ON videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_video_locations_video ON video_locations(video_id);
CREATE INDEX IF NOT EXISTS idx_video_locations_location ON video_locations(location_id);

-- Enable RLS
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypass)
CREATE POLICY "Service role full access on video_categories"
  ON video_categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on videos"
  ON videos FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on video_locations"
  ON video_locations FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_video_categories_updated_at BEFORE UPDATE ON video_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default categories
INSERT INTO video_categories (name, slug, description, sort_order)
VALUES 
  ('Fundamentals', 'fundamentals', 'Core techniques and positions every grappler should know', 1),
  ('Self-Defense', 'self-defense', 'Practical self-defense skills for real-world situations', 2),
  ('Drills', 'drills', 'Solo and partner drills to improve your game', 3),
  ('Games', 'games', 'Fun BJJ games that teach important concepts', 4),
  ('Warm-Ups', 'warm-ups', 'Warm-up routines and stretches', 5)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE videos IS 'Video library for technique instruction and training content';
COMMENT ON TABLE video_categories IS 'Categories for organizing videos';
COMMENT ON TABLE video_locations IS 'Controls which locations can access each video';
