import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { z } from 'zod';

// Validation schema for creating a thread
const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(10000),
  locationId: z.string(),
});

// GET: Fetch threads for a specific location
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail === ADMIN_EMAIL;

    const { searchParams } = new URL(request.url);
    const locationIdOrSlug = searchParams.get('locationId');

    if (!locationIdOrSlug) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Try to find location by ID first, then by slug
    let locationId = locationIdOrSlug;
    
    // Check if it's a UUID (Supabase ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationIdOrSlug);
    
    if (!isUUID) {
      // It's a slug, look up the real location ID from Supabase
      const { data: locationBySlug } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('slug', locationIdOrSlug)
        .single();
      
      if (locationBySlug) {
        locationId = locationBySlug.id;
      } else {
        // Try matching by partial slug (e.g., 'lionheart-central' -> 'lionheart-central-church')
        const { data: locationByPartialSlug } = await supabaseAdmin
          .from('locations')
          .select('id, slug')
          .ilike('slug', `${locationIdOrSlug}%`)
          .limit(1)
          .single();
        
        if (locationByPartialSlug) {
          locationId = locationByPartialSlug.id;
        }
      }
    }

    // Fetch threads from Supabase
    const { data: threads, error: threadsError } = await supabaseAdmin
      .from('discussion_threads')
      .select('*')
      .eq('location_id', locationId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
      throw threadsError;
    }

    // Get reply counts
    const threadIds = (threads || []).map(t => t.id);
    const { data: replyCounts } = await supabaseAdmin
      .from('discussion_replies')
      .select('thread_id')
      .in('thread_id', threadIds.length > 0 ? threadIds : ['none']);

    const replyCountMap: Record<string, number> = {};
    (replyCounts || []).forEach(r => {
      replyCountMap[r.thread_id] = (replyCountMap[r.thread_id] || 0) + 1;
    });

    // Get unique author IDs and fetch authors
    const authorIds = [...new Set((threads || []).map(t => t.author_id).filter(Boolean))];
    const { data: authors } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', authorIds.length > 0 ? authorIds : ['none']);

    const authorMap = new Map((authors || []).map(a => [a.id, a]));

    // Get location name
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .single();

    // Format threads for response
    const formattedThreads = (threads || []).map(thread => {
      const author = authorMap.get(thread.author_id);
      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        isPinned: thread.is_pinned,
        isLocked: thread.is_locked,
        createdAt: thread.created_at,
        replyCount: replyCountMap[thread.id] || 0,
        author: {
          firstName: author?.first_name || 'Unknown',
          lastName: author?.last_name || 'User',
          isAdmin: (author?.email || thread.author_email) === ADMIN_EMAIL,
        },
        location: { name: location?.name || 'Unknown' },
      };
    });

    return NextResponse.json({ threads: formattedThreads });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

// POST: Create a new thread
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    const clerkUserId = user.id;

    const body = await request.json();
    const parsed = createThreadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { title, content, locationId: locationIdOrSlug } = parsed.data;

    // Resolve location ID (could be UUID or slug)
    let locationId = locationIdOrSlug;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationIdOrSlug);
    
    if (!isUUID) {
      // Look up by slug
      const { data: locationBySlug } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('slug', locationIdOrSlug)
        .single();
      
      if (locationBySlug) {
        locationId = locationBySlug.id;
      } else {
        // Try partial match
        const { data: locationByPartialSlug } = await supabaseAdmin
          .from('locations')
          .select('id')
          .ilike('slug', `${locationIdOrSlug}%`)
          .limit(1)
          .single();
        
        if (locationByPartialSlug) {
          locationId = locationByPartialSlug.id;
        } else {
          return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }
      }
    }

    // Get or create user in Supabase
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!dbUser) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: userEmail,
          first_name: user.firstName || 'Unknown',
          last_name: user.lastName || 'User',
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      dbUser = newUser;
    }

    // Create thread in Supabase
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .insert({
        location_id: locationId,
        author_id: dbUser.id,
        author_email: userEmail,
        title,
        content,
      })
      .select('id, title, content, created_at')
      .single();

    if (threadError) throw threadError;

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
