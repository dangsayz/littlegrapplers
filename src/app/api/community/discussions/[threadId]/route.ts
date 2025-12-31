import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

// GET: Fetch single thread with replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    // Fetch thread (simplified query without FK joins)
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError) {
      console.error('Thread fetch error:', threadError);
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Fetch location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug')
      .eq('id', thread.location_id)
      .single();

    // Fetch author
    const { data: author } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', thread.author_id)
      .single();

    // Fetch replies
    const { data: replies } = await supabaseAdmin
      .from('discussion_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    // Fetch media for thread
    const { data: threadMedia } = await supabaseAdmin
      .from('media_attachments')
      .select('id, file_url, file_type, file_name')
      .eq('thread_id', threadId);

    // Fetch media for replies
    const replyIds = (replies || []).map(r => r.id);
    const { data: replyMedia } = await supabaseAdmin
      .from('media_attachments')
      .select('id, file_url, file_type, file_name, reply_id')
      .in('reply_id', replyIds.length > 0 ? replyIds : ['none']);

    const replyMediaMap = new Map<string, typeof replyMedia>();
    (replyMedia || []).forEach(m => {
      const existing = replyMediaMap.get(m.reply_id!) || [];
      replyMediaMap.set(m.reply_id!, [...existing, m]);
    });

    // Get reply authors
    const replyAuthorIds = [...new Set((replies || []).map(r => r.author_id))];
    const { data: replyAuthors } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', replyAuthorIds.length > 0 ? replyAuthorIds : ['none']);

    const authorMap = new Map((replyAuthors || []).map(a => [a.id, a]));

    // Format response
    const formattedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      isPinned: thread.is_pinned,
      isLocked: thread.is_locked,
      createdAt: thread.created_at,
      location: location ? {
        id: location.id,
        name: location.name,
        slug: location.slug,
      } : null,
      author: {
        email: author?.email || thread.author_email || 'unknown',
        firstName: author?.first_name || 'Unknown',
        lastName: author?.last_name || 'User',
        isAdmin: (author?.email || thread.author_email) === ADMIN_EMAIL,
      },
      media: (threadMedia || []).map(m => ({
        id: m.id,
        url: m.file_url,
        type: m.file_type,
        name: m.file_name,
      })),
      videoLinks: thread.video_links || [],
      replies: (replies || []).map(reply => {
        const replyAuthor = authorMap.get(reply.author_id);
        const media = replyMediaMap.get(reply.id) || [];
        return {
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at,
          author: {
            email: replyAuthor?.email || 'unknown',
            firstName: replyAuthor?.first_name || 'Unknown',
            lastName: replyAuthor?.last_name || 'User',
          },
          media: media.map(m => ({
            id: m.id,
            url: m.file_url,
            type: m.file_type,
            name: m.file_name,
          })),
        };
      }),
    };

    return NextResponse.json(formattedThread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

// PATCH: Update thread (author or admin only)
export async function PATCH(
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
    const isAdmin = userEmail === ADMIN_EMAIL;

    // Get thread to check ownership
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .select('author_email')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Check if user is author or admin
    if (thread.author_email !== userEmail && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to edit this thread' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    const updateData: Record<string, string> = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    const { error: updateError } = await supabaseAdmin
      .from('discussion_threads')
      .update(updateData)
      .eq('id', threadId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
  }
}

// DELETE: Delete thread (author or admin only)
export async function DELETE(
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
    const isAdmin = userEmail === ADMIN_EMAIL;

    // Get thread to check ownership
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .select('author_email, location_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Check if user is author or admin
    if (thread.author_email !== userEmail && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this thread' }, { status: 403 });
    }

    // Get location slug for redirect
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('slug')
      .eq('id', thread.location_id)
      .single();

    // Delete thread (cascade will delete replies and media)
    const { error: deleteError } = await supabaseAdmin
      .from('discussion_threads')
      .delete()
      .eq('id', threadId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, locationSlug: location?.slug });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
