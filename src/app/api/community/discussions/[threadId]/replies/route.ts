import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import { sendReplyNotification } from '@/lib/email';

// GET: Fetch replies for a thread
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    // Fetch replies
    const { data: replies, error } = await supabaseAdmin
      .from('discussion_replies')
      .select('id, content, created_at, author_id, author_email')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    // Fetch author info separately
    const authorIds = [...new Set((replies || []).map(r => r.author_id).filter(Boolean))];
    let authorMap = new Map();
    
    if (authorIds.length > 0) {
      const { data: authors } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', authorIds);
      
      authorMap = new Map((authors || []).map(a => [a.id, a]));
    }

    const formattedReplies = (replies || []).map(reply => {
      const author = authorMap.get(reply.author_id);
      return {
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        authorEmail: reply.author_email,
        author: {
          email: author?.email || reply.author_email,
          firstName: author?.first_name || null,
          lastName: author?.last_name || null,
        },
      };
    });

    return NextResponse.json({ replies: formattedReplies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// POST: Create a reply to a thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const clerkUserId = user.id;

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 1) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    // Get thread to verify it exists and get details for notification
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .select(`
        id,
        title,
        is_locked,
        author_email,
        author:users!discussion_threads_author_id_fkey (
          first_name,
          last_name,
          email
        ),
        location:locations!discussion_threads_location_id_fkey (
          slug,
          name
        )
      `)
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.is_locked) {
      return NextResponse.json({ error: 'Thread is locked' }, { status: 403 });
    }

    // Get location details for PIN verification and notification
    const location = thread.location as unknown as { slug: string; name: string } | null;
    const locationSlug = location?.slug;
    const locationName = location?.name || 'your community';
    
    // Get thread author info for notification
    const threadAuthor = thread.author as unknown as { first_name: string; last_name: string; email: string } | null;
    const threadAuthorEmail = threadAuthor?.email || thread.author_email;
    const threadAuthorName = threadAuthor ? `${threadAuthor.first_name || ''} ${threadAuthor.last_name || ''}`.trim() : 'there';

    // Verify PIN access (check cookie)
    if (locationSlug) {
      const cookieStore = await cookies();
      const pinVerified = cookieStore.get(`pin_verified_${locationSlug}`)?.value;
      
      if (!pinVerified && (!userEmail || !ADMIN_EMAILS.includes(userEmail))) {
        return NextResponse.json({ error: 'PIN verification required' }, { status: 403 });
      }
    }

    // Get or create user in our database
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
    } else {
      // Sync Clerk name to database on each reply
      await supabaseAdmin
        .from('users')
        .update({
          first_name: user.firstName || 'Unknown',
          last_name: user.lastName || 'User',
        })
        .eq('clerk_user_id', clerkUserId);
    }

    // Create reply
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('discussion_replies')
      .insert({
        thread_id: threadId,
        author_id: dbUser.id,
        author_email: userEmail,
        content: content.trim(),
      })
      .select('id, content, created_at')
      .single();

    if (replyError) throw replyError;

    // Send notification to thread author (async, don't block response)
    if (threadAuthorEmail && locationSlug) {
      sendReplyNotification({
        threadId,
        threadTitle: thread.title,
        threadAuthorEmail,
        threadAuthorName: threadAuthorName || 'there',
        replyAuthorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Someone',
        replyAuthorEmail: userEmail || '',
        replyContent: content.trim(),
        locationSlug,
        locationName,
      }).catch((err: unknown) => console.error('Failed to send reply notification:', err));
    }

    return NextResponse.json({
      id: reply.id,
      content: reply.content,
      createdAt: reply.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}

// PATCH: Update reply (author or admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

    const body = await request.json();
    const { replyId, content } = body;

    if (!replyId || !content) {
      return NextResponse.json({ error: 'Reply ID and content required' }, { status: 400 });
    }

    // Get reply to check ownership
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('discussion_replies')
      .select('author_email')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Check if user is author or admin
    if (reply.author_email !== userEmail && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to edit this reply' }, { status: 403 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('discussion_replies')
      .update({ content })
      .eq('id', replyId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 });
  }
}

// DELETE: Delete reply (author or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('replyId');

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID required' }, { status: 400 });
    }

    // Get reply to check ownership
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('discussion_replies')
      .select('author_email')
      .eq('id', replyId)
      .single();

    if (replyError || !reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Check if user is author or admin
    if (reply.author_email !== userEmail && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this reply' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('discussion_replies')
      .delete()
      .eq('id', replyId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
  }
}
