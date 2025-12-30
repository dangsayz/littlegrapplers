import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch single student (parent must own this student)
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

    const { data: student, error } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('id', id)
      .eq('clerk_user_id', userId)
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

// PUT - Update student (parent must own this student)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('signed_waivers')
      .select('id')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.child_full_name) {
      return NextResponse.json({ error: 'Child name is required' }, { status: 400 });
    }

    // Build update object - parents can only update certain fields
    const updateData: Record<string, string | null> = {
      child_full_name: body.child_full_name,
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
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update student error:', error);
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
