import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to create admin notification
async function createAdminNotification(data: {
  notification_type: string;
  user_id?: string;
  student_id?: string;
  request_id?: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  priority?: string;
}) {
  try {
    await supabaseAdmin.from('admin_notifications').insert({
      notification_type: data.notification_type,
      user_id: data.user_id || null,
      student_id: data.student_id || null,
      request_id: data.request_id || null,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      priority: data.priority || 'normal',
    });
  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
}

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

// DELETE - Soft delete student (deactivate)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body for reason
    let reason = 'Parent requested removal';
    try {
      const body = await request.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch {
      // No body provided, use default reason
    }

    // Verify ownership and get student details
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, clerk_user_id, guardian_full_name, guardian_email')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if student has active memberships/subscriptions
    const { data: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('clerk_user_id', userId)
      .in('status', ['active', 'pending']);

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot remove student with active membership. Please cancel your membership first.',
        hasActiveMembership: true,
      }, { status: 400 });
    }

    // Soft delete - mark as inactive
    const { error: updateError } = await supabaseAdmin
      .from('signed_waivers')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason,
      })
      .eq('id', id)
      .eq('clerk_user_id', userId);

    if (updateError) {
      console.error('Soft delete student error:', updateError);
      return NextResponse.json({ error: 'Failed to remove student' }, { status: 500 });
    }

    // Get user ID for notification
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    // Create admin notification (don't pass student_id as it references students table, not signed_waivers)
    await createAdminNotification({
      notification_type: 'student_removal_request',
      user_id: dbUser?.id,
      title: 'Student Removed by Parent',
      message: `${existing.guardian_full_name} removed ${existing.child_full_name} from their account. Reason: ${reason}`,
      metadata: {
        waiver_id: id,
        student_name: existing.child_full_name,
        guardian_name: existing.guardian_full_name,
        guardian_email: existing.guardian_email,
        reason: reason,
      },
      priority: 'normal',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Student removed successfully',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Reactivate a soft-deleted student
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (body.action === 'reactivate') {
      // Verify ownership
      const { data: existing } = await supabaseAdmin
        .from('signed_waivers')
        .select('id, is_active')
        .eq('id', id)
        .eq('clerk_user_id', userId)
        .single();

      if (!existing) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      if (existing.is_active) {
        return NextResponse.json({ error: 'Student is already active' }, { status: 400 });
      }

      // Reactivate
      const { error: updateError } = await supabaseAdmin
        .from('signed_waivers')
        .update({
          is_active: true,
          deactivated_at: null,
          deactivation_reason: null,
        })
        .eq('id', id)
        .eq('clerk_user_id', userId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to reactivate student' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Student reactivated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Patch student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
