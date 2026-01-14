import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Create a new student
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, dateOfBirth, locationId } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found. Please complete onboarding first.' }, { status: 400 });
    }

    // Get or create parent profile
    let parentId: string;
    const { data: existingParent } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('user_id', dbUser.id)
      .single();

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      // Create parent profile if doesn't exist
      const { data: newParent, error: parentError } = await supabaseAdmin
        .from('parents')
        .insert({
          user_id: dbUser.id,
          first_name: firstName,
          last_name: lastName,
        })
        .select('id')
        .single();

      if (parentError || !newParent) {
        console.error('Error creating parent:', parentError);
        return NextResponse.json({ error: 'Failed to create parent profile' }, { status: 500 });
      }
      parentId = newParent.id;
    }

    // Create student record
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        parent_id: parentId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth || null,
        belt_rank: 'white',
        stripes: 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (studentError || !student) {
      console.error('Error creating student:', studentError);
      return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }

    // Assign student to location if provided
    if (locationId) {
      await supabaseAdmin
        .from('student_locations')
        .insert({
          student_id: student.id,
          location_id: locationId,
        });
    }

    return NextResponse.json({
      success: true,
      studentId: student.id,
      message: 'Student added successfully',
    });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
