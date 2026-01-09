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
    const { status } = body;

    const validStatuses = ['pending', 'approved', 'active', 'cancelled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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
        status,
        reviewed_by: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating enrollment status:', updateError);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // If changing to active and there's a student, update student_locations too
    if (status === 'active' && enrollment.student_id && enrollment.location_id) {
      await supabaseAdmin
        .from('student_locations')
        .upsert({
          student_id: enrollment.student_id,
          location_id: enrollment.location_id,
        }, {
          onConflict: 'student_id,location_id',
        });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: adminUser?.id,
      admin_email: userEmail,
      action: `enrollment.status_changed`,
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        old_status: enrollment.status,
        new_status: status,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
