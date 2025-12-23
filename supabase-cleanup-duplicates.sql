-- Cleanup duplicate RLS policies and indexes
-- Run this in Supabase SQL Editor

-- ============================================
-- DROP DUPLICATE RLS POLICIES
-- ============================================

-- discussion_replies: Drop one of the duplicate service role policies
DROP POLICY IF EXISTS "Service role can do anything on discussion_replies" ON public.discussion_replies;

-- discussion_threads: Drop one of the duplicate service role policies
DROP POLICY IF EXISTS "Service role can do anything on discussion_threads" ON public.discussion_threads;

-- ============================================
-- DROP DUPLICATE INDEXES
-- ============================================

-- discussion_replies: Drop duplicate thread index (keeping idx_discussion_replies_thread)
DROP INDEX IF EXISTS idx_replies_thread;

-- discussion_threads: Drop duplicate author index (keeping idx_discussion_threads_author)
DROP INDEX IF EXISTS idx_threads_author;

-- discussion_threads: Drop duplicate location index (keeping idx_discussion_threads_location)
DROP INDEX IF EXISTS idx_threads_location;
