import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import { sanitizeString } from '@/lib/validation';
import { sendCommunityPostNotification } from '@/lib/email';

// Rate limiting: Track posts per user (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_POSTS = 5; // Max 5 posts per minute

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_POSTS) {
    return { allowed: false, retryAfter: Math.ceil((userLimit.resetAt - now) / 1000) };
  }
  
  userLimit.count++;
  return { allowed: true };
}

// GET: Fetch threads for a location (by slug)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationSlug = searchParams.get('locationSlug');

    if (!locationSlug) {
      return NextResponse.json({ error: 'Location slug required' }, { status: 400 });
    }

    // Get location by slug
    const { data: location, error: locError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('slug', locationSlug)
      .single();

    if (locError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Fetch threads for this location (simplified query)
    const { data: threads, error: threadsError } = await supabaseAdmin
      .from('discussion_threads')
      .select('*')
      .eq('location_id', location.id)
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

    // Get media attachments for threads
    const { data: mediaAttachments } = await supabaseAdmin
      .from('media_attachments')
      .select('id, thread_id, file_url, file_type, file_name')
      .in('thread_id', threadIds.length > 0 ? threadIds : ['none']);

    const mediaMap = new Map<string, Array<{ id: string; url: string; type: string; name: string }>>();
    (mediaAttachments || []).forEach(m => {
      const existing = mediaMap.get(m.thread_id) || [];
      mediaMap.set(m.thread_id, [...existing, {
        id: m.id,
        url: m.file_url,
        type: m.file_type,
        name: m.file_name,
      }]);
    });

    // Get unique author IDs and fetch authors
    const authorIds = [...new Set((threads || []).map(t => t.author_id))];
    const { data: authors } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', authorIds.length > 0 ? authorIds : ['none']);

    const authorMap = new Map((authors || []).map(a => [a.id, a]));

    // Format response
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
        media: mediaMap.get(thread.id) || [],
        author: {
          email: author?.email || thread.author_email || 'unknown',
          firstName: author?.first_name || 'Unknown',
          lastName: author?.last_name || 'User',
          isAdmin: ADMIN_EMAILS.includes(author?.email || thread.author_email || ''),
        },
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

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const clerkUserId = user.id;

    // Rate limiting check
    const rateCheck = checkRateLimit(clerkUserId);
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        error: `Too many posts. Please wait ${rateCheck.retryAfter} seconds.` 
      }, { status: 429 });
    }

    const body = await request.json();
    const { locationSlug, title: rawTitle, content: rawContent, videoLinks } = body;

    if (!locationSlug || !rawTitle || !rawContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize inputs to prevent XSS
    const title = sanitizeString(rawTitle);
    const content = sanitizeString(rawContent);

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json({ error: 'Title must be 3-200 characters' }, { status: 400 });
    }

    if (content.length < 10 || content.length > 10000) {
      return NextResponse.json({ error: 'Content must be 10-10000 characters' }, { status: 400 });
    }

    // Get location by slug
    const { data: location, error: locError } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', locationSlug)
      .single();

    if (locError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Verify PIN access (check cookie)
    const cookieStore = await cookies();
    const pinVerified = cookieStore.get(`pin_verified_${locationSlug}`)?.value;
    
    if (!pinVerified && (!userEmail || !ADMIN_EMAILS.includes(userEmail))) {
      return NextResponse.json({ error: 'PIN verification required' }, { status: 403 });
    }

    // Get or create user in our database
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!dbUser) {
      // Create user if doesn't exist
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

    // Create thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .insert({
        location_id: location.id,
        author_id: dbUser.id,
        author_email: userEmail,
        title,
        content,
        video_links: videoLinks || [],
      })
      .select('id, title, content, created_at')
      .single();

    if (threadError) throw threadError;

    // Send email notifications to location members (async, don't block response)
    sendCommunityPostNotification({
      threadId: thread.id,
      threadTitle: thread.title,
      authorName: `${user.firstName || 'A'} ${user.lastName || 'member'}`,
      authorEmail: userEmail || '',
      locationId: location.id,
      locationSlug: locationSlug,
    }).catch((err: unknown) => console.error('Failed to send community notifications:', err));

    return NextResponse.json({ 
      id: thread.id,
      title: thread.title,
      content: thread.content,
      createdAt: thread.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
