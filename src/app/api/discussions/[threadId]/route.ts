import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';

// GET: Fetch a single thread with replies
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

    // Fetch thread from Supabase
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('discussion_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Fetch replies
    const { data: replies } = await supabaseAdmin
      .from('discussion_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    // Get author info
    const { data: author } = await supabaseAdmin
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', thread.author_id)
      .single();

    // Get location info
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug')
      .eq('id', thread.location_id)
      .single();

    // Get reply authors
    const replyAuthorIds = [...new Set((replies || []).map(r => r.author_id).filter(Boolean))];
    const { data: replyAuthors } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', replyAuthorIds.length > 0 ? replyAuthorIds : ['none']);

    const replyAuthorMap = new Map((replyAuthors || []).map(a => [a.id, a]));

    const formattedThread = {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      isPinned: thread.is_pinned,
      isLocked: thread.is_locked,
      createdAt: thread.created_at,
      author: {
        email: author?.email || thread.author_email || 'unknown',
        firstName: author?.first_name || 'Unknown',
        lastName: author?.last_name || 'User',
      },
      location: {
        id: location?.id,
        name: location?.name || 'Unknown',
        slug: location?.slug,
      },
      replies: (replies || []).map(reply => {
        const replyAuthor = replyAuthorMap.get(reply.author_id);
        return {
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at,
          author: {
            email: replyAuthor?.email || reply.author_email || 'unknown',
            firstName: replyAuthor?.first_name || 'Unknown',
            lastName: replyAuthor?.last_name || 'User',
          },
        };
      }),
    };

    return NextResponse.json({ thread: formattedThread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

// DELETE: Delete a thread (admin or author only)
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
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail === ADMIN_EMAIL;

    // Fetch thread to check ownership
    const { data: thread, error: fetchError } = await supabaseAdmin
      .from('discussion_threads')
      .select('id, author_email, location_id')
      .eq('id', threadId)
      .single();

    if (fetchError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Only admin or author can delete
    if (!isAdmin && thread.author_email !== userEmail) {
      return NextResponse.json({ error: 'Not authorized to delete' }, { status: 403 });
    }

    // Delete replies first
    await supabaseAdmin
      .from('discussion_replies')
      .delete()
      .eq('thread_id', threadId);

    // Delete thread
    const { error: deleteError } = await supabaseAdmin
      .from('discussion_threads')
      .delete()
      .eq('id', threadId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
