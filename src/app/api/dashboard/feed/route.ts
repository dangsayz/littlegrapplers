import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

interface FeedItem {
  id: string;
  type: 'new_student' | 'new_post' | 'new_media' | 'location_update';
  title: string;
  description: string;
  timestamp: string;
  locationName?: string;
  locationSlug?: string;
  metadata?: Record<string, unknown>;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || '';
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const feed: FeedItem[] = [];

    // Get all locations for mapping
    const { data: allLocations } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug');
    const locationMap = new Map(allLocations?.map(l => [l.id, l]) || []);
    const allLocationIds = allLocations?.map(l => l.id) || [];

    // Get user's locations (or all for admins)
    let userLocationIds: string[] = [];
    
    if (isAdmin) {
      // Admins see all locations
      userLocationIds = allLocationIds;
    } else {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (dbUser) {
        const { data: userLocs } = await supabaseAdmin
          .from('user_locations')
          .select('location_id')
          .eq('user_id', dbUser.id);
        
        userLocationIds = userLocs?.map(ul => ul.location_id) || [];
      }
    }

    // Fetch recent discussion threads from user's locations
    if (userLocationIds.length > 0) {
      const { data: threads } = await supabaseAdmin
        .from('discussion_threads')
        .select('id, title, content, created_at, author_name, location_id')
        .in('location_id', userLocationIds)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (threads) {
        for (const thread of threads) {
          const loc = locationMap.get(thread.location_id);
          feed.push({
            id: `thread-${thread.id}`,
            type: 'new_post',
            title: thread.title,
            description: `${thread.author_name || 'Someone'} posted in ${loc?.name || 'your community'}`,
            timestamp: thread.created_at,
            locationName: loc?.name,
            locationSlug: loc?.slug,
            metadata: { threadId: thread.id },
          });
        }
      }
    }

    // Fetch recent media uploads from user's locations
    if (userLocationIds.length > 0) {
      const { data: media } = await supabaseAdmin
        .from('location_media')
        .select('id, title, media_type, created_at, uploaded_by_name, location_id')
        .in('location_id', userLocationIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (media) {
        for (const m of media) {
          const loc = locationMap.get(m.location_id);
          feed.push({
            id: `media-${m.id}`,
            type: 'new_media',
            title: m.title || `New ${m.media_type === 'video' ? 'video' : 'photo'}`,
            description: `${m.uploaded_by_name || 'Coach'} shared a ${m.media_type === 'video' ? 'video' : 'photo'}`,
            timestamp: m.created_at,
            locationName: loc?.name,
            locationSlug: loc?.slug,
            metadata: { mediaId: m.id, mediaType: m.media_type },
          });
        }
      }
    }

    // Get recent enrollments/signups
    if (userLocationIds.length > 0) {
      const { data: recentEnrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id, child_first_name, child_last_name, created_at, location_id')
        .in('location_id', userLocationIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentEnrollments) {
        for (const e of recentEnrollments) {
          const loc = locationMap.get(e.location_id);
          feed.push({
            id: `enrollment-${e.id}`,
            type: 'new_student',
            title: 'New student joined',
            description: `${e.child_first_name} joined ${loc?.name || 'the class'}`,
            timestamp: e.created_at,
            locationName: loc?.name,
            locationSlug: loc?.slug,
          });
        }
      }
    }

    // Sort by timestamp (newest first)
    feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 15 items
    const limitedFeed = feed.slice(0, 15);

    return NextResponse.json({ feed: limitedFeed });
  } catch (error) {
    console.error('Dashboard feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
