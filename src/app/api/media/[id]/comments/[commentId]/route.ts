import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: existingComment } = await supabaseAdmin
      .from('media_comments')
      .select('user_email')
      .eq('id', commentId)
      .single();

    if (existingComment?.user_email !== userEmail) {
      return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('media_comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Comment update error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

    const { commentId } = await params;

    // Verify ownership
    const { data: existingComment } = await supabaseAdmin
      .from('media_comments')
      .select('user_email')
      .eq('id', commentId)
      .single();

    if (existingComment?.user_email !== userEmail) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('media_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
