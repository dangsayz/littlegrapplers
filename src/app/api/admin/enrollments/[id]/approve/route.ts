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
      return NextResponse.json({ error: 'Only pending enrollments can be approved' }, { status: 400 });
    }

    // Get admin user ID for audit
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Start transaction: Create student, update enrollment
    
    // 1. Check if user exists, if not create one
    let userId = enrollment.user_id;
    
    if (!userId && enrollment.guardian_email) {
      // Check if user exists by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', enrollment.guardian_email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create user record
        const { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            email: enrollment.guardian_email,
            first_name: enrollment.guardian_first_name,
            last_name: enrollment.guardian_last_name,
            phone: enrollment.guardian_phone,
            status: 'active',
          })
          .select('id')
          .single();

        if (userError) {
          console.error('Error creating user:', userError);
          return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
        }
        userId = newUser.id;
      }
    }

    // 2. Check if parent exists, if not create one
    let parentId: string | null = null;
    
    if (userId) {
      const { data: existingParent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingParent) {
        parentId = existingParent.id;
      } else {
        const { data: newParent, error: parentError } = await supabaseAdmin
          .from('parents')
          .insert({
            user_id: userId,
            first_name: enrollment.guardian_first_name,
            last_name: enrollment.guardian_last_name,
            phone: enrollment.guardian_phone,
            emergency_contact_name: enrollment.emergency_contact_name,
            emergency_contact_phone: enrollment.emergency_contact_phone,
            photo_consent: enrollment.photo_media_consent,
            waiver_accepted: true,
            waiver_accepted_at: enrollment.waiver_agreed_at,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (parentError) {
          console.error('Error creating parent:', parentError);
          return NextResponse.json({ error: 'Failed to create parent record' }, { status: 500 });
        }
        parentId = newParent.id;
      }
    }

    // 3. Create student record
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        parent_id: parentId,
        first_name: enrollment.child_first_name,
        last_name: enrollment.child_last_name,
        date_of_birth: enrollment.child_date_of_birth,
        belt_rank: 'white',
        stripes: 0,
      })
      .select('id')
      .single();

    if (studentError) {
      console.error('Error creating student:', studentError);
      return NextResponse.json({ error: 'Failed to create student record' }, { status: 500 });
    }

    // 4. Assign student to location
    if (enrollment.location_id) {
      await supabaseAdmin
        .from('student_locations')
        .insert({
          student_id: student.id,
          location_id: enrollment.location_id,
        });

      // Also add user to user_locations for community access
      if (userId) {
        await supabaseAdmin
          .from('user_locations')
          .upsert({
            user_id: userId,
            location_id: enrollment.location_id,
          }, {
            onConflict: 'user_id,location_id',
          });
      }
    }

    // 5. Update enrollment status
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'approved',
        student_id: student.id,
        user_id: userId,
        reviewed_by: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating enrollment:', updateError);
      return NextResponse.json({ error: 'Failed to update enrollment status' }, { status: 500 });
    }

    // 6. Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: adminUser?.id,
      admin_email: userEmail,
      action: 'enrollment.approved',
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        student_id: student.id,
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        location_id: enrollment.location_id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment approved successfully',
      studentId: student.id,
    });
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
