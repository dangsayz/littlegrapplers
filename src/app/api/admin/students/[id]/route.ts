import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

// GET - Fetch single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: student, error } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.child_full_name || !body.parent_first_name || !body.parent_last_name || !body.parent_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build update object with only provided fields
    const updateData: Record<string, string | null> = {
      child_full_name: body.child_full_name,
      parent_first_name: body.parent_first_name,
      parent_last_name: body.parent_last_name,
      parent_email: body.parent_email,
    };

    // Add optional fields if provided
    if (body.child_date_of_birth !== undefined) {
      updateData.child_date_of_birth = body.child_date_of_birth || null;
    }
    if (body.child_gender !== undefined) {
      updateData.child_gender = body.child_gender || null;
    }
    if (body.medical_conditions !== undefined) {
      updateData.medical_conditions = body.medical_conditions || null;
    }
    if (body.allergies !== undefined) {
      updateData.allergies = body.allergies || null;
    }
    if (body.parent_phone !== undefined) {
      updateData.parent_phone = body.parent_phone || null;
    }
    if (body.parent_address !== undefined) {
      updateData.parent_address = body.parent_address || null;
    }
    if (body.emergency_contact_name !== undefined) {
      updateData.emergency_contact_name = body.emergency_contact_name || null;
    }
    if (body.emergency_contact_phone !== undefined) {
      updateData.emergency_contact_phone = body.emergency_contact_phone || null;
    }
    if (body.emergency_contact_relationship !== undefined) {
      updateData.emergency_contact_relationship = body.emergency_contact_relationship || null;
    }

    const { data: student, error } = await supabaseAdmin
      .from('signed_waivers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update student error:', error);
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    // Log the activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        action: 'student.updated',
        entity_type: 'student',
        entity_id: id,
        details: { updated_by: user.emailAddresses[0]?.emailAddress },
      });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the student data for logging
    const { data: student } = await supabaseAdmin
      .from('signed_waivers')
      .select('child_full_name, parent_email')
      .eq('id', id)
      .single();

    // Delete the student
    const { error } = await supabaseAdmin
      .from('signed_waivers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete student error:', error);
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }

    // Log the activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        action: 'student.deleted',
        entity_type: 'student',
        entity_id: id,
        details: { 
          deleted_by: user.emailAddresses[0]?.emailAddress,
          child_name: student?.child_full_name,
          parent_email: student?.parent_email,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
