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
    const { locationId } = body;

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Verify location exists
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('id', locationId)
      .eq('is_active', true)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }

    // Get the enrollment
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*, locations(name)')
      .eq('id', id)
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const oldLocationName = enrollment.locations?.name || 'Unknown';

    // Get admin user ID for audit
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Update enrollment location
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        location_id: locationId,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating enrollment location:', updateError);
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    // If there's a student linked, update student_locations too
    if (enrollment.student_id) {
      // Remove old location assignment
      await supabaseAdmin
        .from('student_locations')
        .delete()
        .eq('student_id', enrollment.student_id)
        .eq('location_id', enrollment.location_id);

      // Add new location assignment
      await supabaseAdmin
        .from('student_locations')
        .upsert({
          student_id: enrollment.student_id,
          location_id: locationId,
        }, {
          onConflict: 'student_id,location_id',
        });
    }

    // If there's a user linked, update user_locations too
    if (enrollment.user_id) {
      await supabaseAdmin
        .from('user_locations')
        .upsert({
          user_id: enrollment.user_id,
          location_id: locationId,
        }, {
          onConflict: 'user_id,location_id',
        });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: adminUser?.id,
      admin_email: userEmail,
      action: 'enrollment.location_changed',
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        old_location: oldLocationName,
        new_location: location.name,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('Error updating enrollment location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
