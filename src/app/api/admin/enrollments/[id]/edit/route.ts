import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import { 
  enrollmentEditSchema, 
  validateData,
  PATTERNS,
} from '@/lib/validation';
import {
  syncEnrollmentToWaiver,
  type EnrollmentToWaiverData,
} from '@/lib/enrollment-sync';


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

    // Validate UUID format to prevent injection
    if (!PATTERNS.uuid.test(id)) {
      return NextResponse.json({ error: 'Invalid enrollment ID format' }, { status: 400 });
    }

    const body = await request.json();

    // Validate and sanitize input using schema with transformations
    const validation = validateData(enrollmentEditSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;

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

    // Update enrollment
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        guardian_first_name: data.guardian_first_name,
        guardian_last_name: data.guardian_last_name,
        guardian_email: data.guardian_email,
        guardian_phone: data.guardian_phone || null,
        child_first_name: data.child_first_name,
        child_last_name: data.child_last_name,
        child_date_of_birth: data.child_date_of_birth || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating enrollment:', updateError);
      return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
    }

    // If there's a linked student, update their info too
    if (enrollment.student_id) {
      await supabaseAdmin
        .from('students')
        .update({
          first_name: data.child_first_name,
          last_name: data.child_last_name,
          date_of_birth: data.child_date_of_birth || null,
        })
        .eq('id', enrollment.student_id);
    }

    // If there's a linked parent, update their info too
    if (enrollment.user_id) {
      // First check if parent exists
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', enrollment.user_id)
        .single();

      if (parent) {
        await supabaseAdmin
          .from('parents')
          .update({
            first_name: data.guardian_first_name,
            last_name: data.guardian_last_name,
            phone: data.guardian_phone || null,
            emergency_contact_name: data.emergency_contact_name || null,
            emergency_contact_phone: data.emergency_contact_phone || null,
          })
          .eq('id', parent.id);
      }

      // Update user record too
      await supabaseAdmin
        .from('users')
        .update({
          first_name: data.guardian_first_name,
          last_name: data.guardian_last_name,
          email: data.guardian_email,
          phone: data.guardian_phone || null,
        })
        .eq('id', enrollment.user_id);
    }

    // SYNC: Update linked signed_waiver record
    const syncData: EnrollmentToWaiverData = {
      guardian_first_name: data.guardian_first_name,
      guardian_last_name: data.guardian_last_name,
      guardian_email: data.guardian_email,
      guardian_phone: data.guardian_phone || null,
      child_first_name: data.child_first_name,
      child_last_name: data.child_last_name,
      emergency_contact_name: data.emergency_contact_name || null,
      emergency_contact_phone: data.emergency_contact_phone || null,
    };

    const syncResult = await syncEnrollmentToWaiver(
      id,
      enrollment.clerk_user_id,
      syncData
    );

    // Log sync warnings but don't fail the request
    if (syncResult.warnings.length > 0) {
      console.log('Sync warnings:', syncResult.warnings);
    }
    if (syncResult.errors.length > 0) {
      console.error('Sync errors (non-blocking):', syncResult.errors);
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: adminUser?.id,
      admin_email: userEmail,
      action: 'enrollment.edited',
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        child_name: `${data.child_first_name} ${data.child_last_name}`,
        changes: Object.keys(data),
        waiver_synced: syncResult.syncedTables.includes('signed_waivers'),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment updated successfully',
      _sync: {
        success: syncResult.success,
        syncedTables: syncResult.syncedTables,
      },
    });
  } catch (error) {
    console.error('Error editing enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
