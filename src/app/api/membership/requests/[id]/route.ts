import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/membership/requests/[id] - Get single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membershipRequest, error } = await supabaseAdmin
      .from('membership_requests')
      .select('*')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single();

    if (error || !membershipRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: membershipRequest });
  } catch (error) {
    console.error('Get membership request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/membership/requests/[id] - Withdraw a pending request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'withdraw') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify ownership and pending status
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('membership_requests')
      .select('id, status, request_type')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existing.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Only pending requests can be withdrawn',
        currentStatus: existing.status,
      }, { status: 400 });
    }

    // Update status to withdrawn
    const { error: updateError } = await supabaseAdmin
      .from('membership_requests')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clerk_user_id', userId);

    if (updateError) {
      console.error('Withdraw request error:', updateError);
      return NextResponse.json({ error: 'Failed to withdraw request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Request withdrawn successfully',
    });
  } catch (error) {
    console.error('Patch membership request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
