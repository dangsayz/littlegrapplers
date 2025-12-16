import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status, notes, first_name, last_name, phone } = body;

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    admin_email: ADMIN_EMAIL,
    action: status ? `user.${status}` : 'user.update',
    entity_type: 'user',
    entity_id: userId,
    details: updates,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user info before deleting for logging
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    admin_email: ADMIN_EMAIL,
    action: 'user.delete',
    entity_type: 'user',
    entity_id: userId,
    details: { email: userData?.email },
  });

  return NextResponse.json({ success: true });
}
