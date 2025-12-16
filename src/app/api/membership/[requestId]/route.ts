import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

// PATCH: Approve or reject a membership request (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { requestId } = await params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the membership request
    const { data: membershipRequest, error: fetchError } = await supabaseAdmin
      .from('membership_requests')
      .select('id, user_id, location_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !membershipRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (membershipRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Get admin user id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', ADMIN_EMAIL)
      .single();

    // Update request status
    const { error: updateError } = await supabaseAdmin
      .from('membership_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser?.id,
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // If approved, add to location_members
    if (action === 'approve') {
      const { error: memberError } = await supabaseAdmin
        .from('location_members')
        .insert({
          user_id: membershipRequest.user_id,
          location_id: membershipRequest.location_id,
          role: 'parent',
        });

      if (memberError && !memberError.message.includes('duplicate')) {
        throw memberError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'approve' ? 'Member approved' : 'Request rejected' 
    });
  } catch (error) {
    console.error('Error processing membership request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Remove a member from a location (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { requestId } = await params;

    // This could be a member ID, so try to delete from location_members
    const { error } = await supabaseAdmin
      .from('location_members')
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
