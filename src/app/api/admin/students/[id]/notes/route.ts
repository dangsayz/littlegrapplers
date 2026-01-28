import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notes } = body;

    // Try to update in students table first (new system)
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .update({ notes })
      .eq('id', id)
      .select('notes')
      .single();

    if (!studentError && studentData) {
      return NextResponse.json({ notes: studentData.notes });
    }

    // Fallback to signed_waivers table (legacy system)
    const { data, error } = await supabaseAdmin
      .from('signed_waivers')
      .update({ notes })
      .eq('id', id)
      .select('notes')
      .single();

    if (error) {
      console.error('Update notes error:', error);
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data.notes });
  } catch (error) {
    console.error('Update notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
