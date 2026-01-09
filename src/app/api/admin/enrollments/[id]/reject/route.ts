import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

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
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get the enrollment
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    if (enrollment.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending enrollments can be rejected' }, { status: 400 });
    }

    // Get admin user ID for audit
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Update enrollment status
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        reviewed_by: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error rejecting enrollment:', updateError);
      return NextResponse.json({ error: 'Failed to reject enrollment' }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: adminUser?.id,
      admin_email: userEmail,
      action: 'enrollment.rejected',
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment rejected',
    });
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
