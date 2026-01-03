import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  
  if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    title, 
    content, 
    is_pinned, 
    is_locked, 
    is_hidden, 
    hidden_reason 
  } = body;

  const updates: Record<string, unknown> = {};
  
  if (title !== undefined) {
    updates.title = title;
    updates.last_edited_at = new Date().toISOString();
  }
  if (content !== undefined) {
    updates.content = content;
    updates.last_edited_at = new Date().toISOString();
    updates.edit_count = supabaseAdmin.rpc('increment', { row_id: threadId });
  }
  if (is_pinned !== undefined) updates.is_pinned = is_pinned;
  if (is_locked !== undefined) updates.is_locked = is_locked;
  if (is_hidden !== undefined) {
    updates.is_hidden = is_hidden;
    if (is_hidden) {
      updates.hidden_at = new Date().toISOString();
      updates.hidden_reason = hidden_reason || null;
    } else {
      updates.hidden_at = null;
      updates.hidden_reason = null;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('discussion_threads')
    .update(updates)
    .eq('id', threadId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  const action = is_hidden !== undefined 
    ? (is_hidden ? 'thread.hide' : 'thread.show')
    : title || content 
      ? 'thread.edit' 
      : is_pinned !== undefined 
        ? (is_pinned ? 'thread.pin' : 'thread.unpin')
        : is_locked !== undefined
          ? (is_locked ? 'thread.lock' : 'thread.unlock')
          : 'thread.update';

  await supabaseAdmin.from('activity_logs').insert({
    admin_email: userEmail,
    action,
    entity_type: 'thread',
    entity_id: threadId,
    details: updates,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  
  if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get thread info before deleting
  const { data: threadData } = await supabaseAdmin
    .from('discussion_threads')
    .select('title, author_email')
    .eq('id', threadId)
    .single();

  const { error } = await supabaseAdmin
    .from('discussion_threads')
    .delete()
    .eq('id', threadId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    admin_email: userEmail,
    action: 'thread.delete',
    entity_type: 'thread',
    entity_id: threadId,
    details: { title: threadData?.title, author: threadData?.author_email },
  });

  return NextResponse.json({ success: true });
}
