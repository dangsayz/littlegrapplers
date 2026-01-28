import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import { z } from 'zod';

const createNewStudentSchema = z.object({
  // Parent info
  guardianFirstName: z.string().min(1, 'First name is required').trim(),
  guardianLastName: z.string().min(1, 'Last name is required').trim(),
  guardianEmail: z.string().email('Valid email is required').trim().toLowerCase(),
  guardianPhone: z.string().optional().default(''),
  // Emergency contact
  emergencyContactName: z.string().optional().default(''),
  emergencyContactPhone: z.string().optional().default(''),
  // Student info
  childFirstName: z.string().min(1, 'Child first name is required').trim(),
  childLastName: z.string().min(1, 'Child last name is required').trim(),
  childDateOfBirth: z.string().min(1, 'Date of birth is required'),
  // Location
  locationId: z.string().uuid('Valid location is required'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createNewStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error.errors[0]?.message || 'Invalid input' 
      }, { status: 400 });
    }

    const data = validation.data;

    // Check if user already exists by email
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', data.guardianEmail)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create user record
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email: data.guardianEmail,
          first_name: data.guardianFirstName,
          last_name: data.guardianLastName,
          phone: data.guardianPhone || null,
          status: 'active',
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Failed to create user:', userError);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
      userId = newUser.id;
    }

    // Check if parent exists
    const { data: existingParent } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .single();

    let parentId: string;

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      // Create parent record
      const { data: newParent, error: parentError } = await supabaseAdmin
        .from('parents')
        .insert({
          user_id: userId,
          first_name: data.guardianFirstName,
          last_name: data.guardianLastName,
          phone: data.guardianPhone || null,
          emergency_contact_name: data.emergencyContactName || null,
          emergency_contact_phone: data.emergencyContactPhone || null,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (parentError) {
        console.error('Failed to create parent:', parentError);
        return NextResponse.json({ error: 'Failed to create parent record' }, { status: 500 });
      }
      parentId = newParent.id;
    }

    // Create student record
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        parent_id: parentId,
        first_name: data.childFirstName,
        last_name: data.childLastName,
        date_of_birth: data.childDateOfBirth,
        belt_rank: 'white',
        stripes: 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (studentError) {
      console.error('Failed to create student:', studentError);
      return NextResponse.json({ error: 'Failed to create student record' }, { status: 500 });
    }

    // Assign student to location
    await supabaseAdmin
      .from('student_locations')
      .insert({
        student_id: student.id,
        location_id: data.locationId,
      });

    // Add user to user_locations for community access
    await supabaseAdmin
      .from('user_locations')
      .upsert({
        user_id: userId,
        location_id: data.locationId,
      }, { onConflict: 'user_id,location_id' });

    // Create enrollment record (approved status, awaiting payment)
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        child_first_name: data.childFirstName,
        child_last_name: data.childLastName,
        child_date_of_birth: data.childDateOfBirth,
        student_id: student.id,
        guardian_first_name: data.guardianFirstName,
        guardian_last_name: data.guardianLastName,
        guardian_email: data.guardianEmail,
        guardian_phone: data.guardianPhone || '',
        emergency_contact_name: data.emergencyContactName || data.guardianFirstName,
        emergency_contact_phone: data.emergencyContactPhone || data.guardianPhone || '',
        location_id: data.locationId,
        status: 'approved',
        digital_signature: `Admin-created by ${userEmail}`,
        waiver_agreed_at: new Date().toISOString(),
        user_id: userId,
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (enrollmentError) {
      console.error('Failed to create enrollment:', enrollmentError);
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
    }

    // Get location name for logging
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('name')
      .eq('id', data.locationId)
      .single();

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'enrollment.admin_created_new',
      entity_type: 'enrollment',
      entity_id: enrollment.id,
      details: {
        student_name: `${data.childFirstName} ${data.childLastName}`,
        student_id: student.id,
        parent_name: `${data.guardianFirstName} ${data.guardianLastName}`,
        guardian_email: data.guardianEmail,
        location_name: location?.name,
      },
    });

    return NextResponse.json({ 
      success: true, 
      enrollmentId: enrollment.id,
      studentId: student.id,
      message: `New student ${data.childFirstName} ${data.childLastName} created. Use "Send Payment Link" to charge the parent.`
    });
  } catch (error) {
    console.error('Error creating new student enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
