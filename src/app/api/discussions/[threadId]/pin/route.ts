import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/constants';

// POST: Toggle pin status (admin only)
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
    const userEmail = user.emailAddresses?.[0]?.emailAddress;

    // Only admin can pin/unpin
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Only admin can pin threads' }, { status: 403 });
    }

    // Get current thread
    const { data: thread, error: fetchError } = await supabaseAdmin
      .from('discussion_threads')
      .select('id, is_pinned')
      .eq('id', threadId)
      .single();

    if (fetchError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Toggle pin status
    const { data: updatedThread, error: updateError } = await supabaseAdmin
      .from('discussion_threads')
      .update({ is_pinned: !thread.is_pinned })
      .eq('id', threadId)
      .select('is_pinned')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      isPinned: updatedThread.is_pinned,
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 });
  }
}
