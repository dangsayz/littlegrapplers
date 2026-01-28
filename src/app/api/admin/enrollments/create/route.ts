import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, locationId } = body;

    if (!studentId || !locationId) {
      return NextResponse.json({ error: 'Student and location are required' }, { status: 400 });
    }

    // Get student details with parent info
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        parent:parents(
          id,
          first_name,
          last_name,
          phone,
          emergency_contact_name,
          emergency_contact_phone,
          user:users(
            id,
            email,
            clerk_user_id
          )
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const parentData = student.parent as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      phone: string;
      emergency_contact_name: string;
      emergency_contact_phone: string;
      user: {
        id: string;
        email: string;
        clerk_user_id: string;
      };
    } | null;

    if (!parentData || !parentData.user) {
      return NextResponse.json({ error: 'Parent account not found for this student' }, { status: 400 });
    }
    
    const parent = parentData;

    // Check if enrollment already exists for this student at this location
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('location_id', locationId)
      .in('status', ['pending', 'approved', 'active'])
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: `An enrollment for ${student.first_name} at this location already exists (${existingEnrollment.status})` 
      }, { status: 400 });
    }

    // Get location name
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .single();

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        // Child info
        child_first_name: student.first_name,
        child_last_name: student.last_name,
        child_date_of_birth: student.date_of_birth,
        student_id: studentId,
        
        // Guardian info from parent
        guardian_first_name: parent.first_name,
        guardian_last_name: parent.last_name,
        guardian_email: parent.user.email,
        guardian_phone: parent.phone || '',
        
        // Emergency contact
        emergency_contact_name: parent.emergency_contact_name || parent.first_name,
        emergency_contact_phone: parent.emergency_contact_phone || parent.phone || '',
        
        // Location
        location_id: locationId,
        
        // Status - approved so admin can send payment link
        status: 'approved',
        
        // Digital signature (required field) - admin-created enrollment
        digital_signature: `Admin-created by ${userEmail}`,
        waiver_agreed_at: new Date().toISOString(),
        
        // Link to user
        clerk_user_id: parent.user.clerk_user_id,
        user_id: parent.user.id,
        
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (enrollmentError) {
      console.error('Failed to create enrollment:', enrollmentError);
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'enrollment.admin_created',
      entity_type: 'enrollment',
      entity_id: enrollment.id,
      details: {
        student_name: `${student.first_name} ${student.last_name}`,
        location_name: location?.name,
        guardian_email: parent.user.email,
      },
    });

    return NextResponse.json({ 
      success: true, 
      enrollmentId: enrollment.id,
      message: `Enrollment created for ${student.first_name} ${student.last_name}. Use "Send Payment Link" to charge the parent.`
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Search students without active enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    if (search.length < 2) {
      return NextResponse.json({ students: [] });
    }

    // Search students by name OR parent email
    // First try searching by student name
    let { data: students, error } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        date_of_birth,
        parent:parents(
          first_name,
          last_name,
          user:users(email)
        )
      `)
      .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      .limit(10);

    // If no results and search looks like an email, search by parent email
    if ((!students || students.length === 0) && search.includes('@')) {
      const { data: parentResults } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .ilike('email', `%${search}%`)
        .limit(5);

      if (parentResults && parentResults.length > 0) {
        // Get students linked to these parents
        const { data: parentData } = await supabaseAdmin
          .from('parents')
          .select('id, user_id')
          .in('user_id', parentResults.map(u => u.id));

        if (parentData && parentData.length > 0) {
          const { data: studentsByParent } = await supabaseAdmin
            .from('students')
            .select(`
              id,
              first_name,
              last_name,
              date_of_birth,
              parent:parents(
                first_name,
                last_name,
                user:users(email)
              )
            `)
            .in('parent_id', parentData.map(p => p.id))
            .limit(10);

          students = studentsByParent || [];
        }
      }
    }

    if (error) {
      console.error('Error searching students:', error);
      return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
    }

    // Format results from students table
    let formattedStudents: Array<{
      id: string;
      name: string;
      dateOfBirth: string;
      parentName: string;
      parentEmail: string;
      source: 'students' | 'enrollments';
    }> = (students || []).map(s => {
      const parent = s.parent as unknown as { first_name: string; last_name: string; user: { email: string } } | null;
      return {
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        dateOfBirth: s.date_of_birth,
        parentName: parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown',
        parentEmail: parent?.user?.email || 'Unknown',
        source: 'students' as const,
      };
    });

    // If no students found, also search enrollments table (legacy data)
    if (formattedStudents.length === 0) {
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id, child_first_name, child_last_name, child_date_of_birth, guardian_first_name, guardian_last_name, guardian_email, student_id')
        .or(`child_first_name.ilike.%${search}%,child_last_name.ilike.%${search}%,guardian_email.ilike.%${search}%`)
        .is('student_id', null)
        .limit(10);

      if (enrollments && enrollments.length > 0) {
        formattedStudents = enrollments.map(e => ({
          id: e.id,
          name: `${e.child_first_name} ${e.child_last_name}`,
          dateOfBirth: e.child_date_of_birth,
          parentName: `${e.guardian_first_name} ${e.guardian_last_name}`,
          parentEmail: e.guardian_email || 'Unknown',
          source: 'enrollments' as const,
        }));
      }
    }

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
