import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEV_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];
const CLIENT_EMAILS = ['info@littlegrapplers.net', 'walkawayy@icloud.com', 'littlegrapplersjitsu@gmail.com'];

function isAuthorized(email: string | undefined): boolean {
  if (!email) return false;
  return DEV_EMAILS.includes(email) || CLIENT_EMAILS.includes(email);
}

// POST: Add a comment to a work order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid work order ID' }, { status: 400 });
    }

    // Validate content
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Verify work order exists
    const { data: workOrder, error: workOrderError } = await supabaseAdmin
      .from('work_orders')
      .select('id')
      .eq('id', id)
      .single();

    if (workOrderError || !workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('work_order_comments')
      .insert({
        work_order_id: id,
        author_email: userEmail,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// PATCH: Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { commentId, content } = body;

    // Validate
    if (!commentId || !content?.trim()) {
      return NextResponse.json({ error: 'Comment ID and content are required' }, { status: 400 });
    }

    // Verify the comment exists and belongs to this user (or user is dev)
    const { data: existingComment, error: fetchError } = await supabaseAdmin
      .from('work_order_comments')
      .select('*')
      .eq('id', commentId)
      .eq('work_order_id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only allow editing own comments (or devs can edit any)
    const isDev = DEV_EMAILS.includes(userEmail || '');
    if (existingComment.author_email !== userEmail && !isDev) {
      return NextResponse.json({ error: 'Cannot edit others comments' }, { status: 403 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('work_order_comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE: Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Verify the comment exists
    const { data: existingComment, error: fetchError } = await supabaseAdmin
      .from('work_order_comments')
      .select('*')
      .eq('id', commentId)
      .eq('work_order_id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only allow deleting own comments (or devs can delete any)
    const isDev = DEV_EMAILS.includes(userEmail || '');
    if (existingComment.author_email !== userEmail && !isDev) {
      return NextResponse.json({ error: 'Cannot delete others comments' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('work_order_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
