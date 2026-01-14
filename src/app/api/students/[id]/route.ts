import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  studentUpdateSchema, 
  validateData,
  PATTERNS,
} from '@/lib/validation';
import {
  syncWaiverToEnrollment,
  syncWaiverDeactivation,
  syncWaiverReactivation,
  splitFullName,
  type WaiverToEnrollmentData,
} from '@/lib/enrollment-sync';

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

    // First, check the students table (via parent relationship)
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (dbUser) {
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', dbUser.id)
        .single();

      if (parent) {
        const { data: studentRecord } = await supabaseAdmin
          .from('students')
          .select('id, first_name, last_name, date_of_birth, belt_rank, stripes, avatar_url, medical_conditions, tshirt_size, notes, is_active')
          .eq('id', id)
          .eq('parent_id', parent.id)
          .neq('is_active', false)
          .single();

        if (studentRecord) {
          // Also fetch parent data for emergency contact info
          const { data: parentData } = await supabaseAdmin
            .from('parents')
            .select('emergency_contact_name, emergency_contact_phone, phone')
            .eq('id', parent.id)
            .single();

          // Return in the format the edit page expects
          return NextResponse.json({
            id: studentRecord.id,
            child_full_name: `${studentRecord.first_name} ${studentRecord.last_name}`.trim(),
            child_date_of_birth: studentRecord.date_of_birth,
            child_gender: null,
            medical_conditions: studentRecord.medical_conditions,
            allergies: null,
            emergency_contact_name: parentData?.emergency_contact_name || null,
            emergency_contact_phone: parentData?.emergency_contact_phone || parentData?.phone || null,
            emergency_contact_relationship: null,
            _source: 'students',
            _parent_id: parent.id,
          });
        }
      }
    }

    // If not found in students table, check signed_waivers
    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .neq('is_active', false)
      .single();

    if (waiver) {
      return NextResponse.json({ ...waiver, _source: 'signed_waivers' });
    }

    // If still not found, check enrollments table
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, child_date_of_birth, emergency_contact_name, emergency_contact_phone, status')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .in('status', ['active', 'approved', 'pending'])
      .single();

    if (enrollment) {
      return NextResponse.json({
        id: enrollment.id,
        child_full_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`.trim(),
        child_date_of_birth: enrollment.child_date_of_birth,
        child_gender: null,
        medical_conditions: null,
        allergies: null,
        emergency_contact_name: enrollment.emergency_contact_name,
        emergency_contact_phone: enrollment.emergency_contact_phone,
        emergency_contact_relationship: null,
        _source: 'enrollments',
      });
    }

    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
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

    // Validate UUID format to prevent injection
    if (!PATTERNS.uuid.test(id)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate and sanitize input using Zod schema
    const validation = validateData(studentUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data;

    // First, check if student exists in the students table
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (dbUser) {
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', dbUser.id)
        .single();

      if (parent) {
        const { data: studentRecord } = await supabaseAdmin
          .from('students')
          .select('id, first_name, last_name')
          .eq('id', id)
          .eq('parent_id', parent.id)
          .neq('is_active', false)
          .single();

        if (studentRecord) {
          // Update students table
          const { firstName, lastName } = splitFullName(validatedData.child_full_name);
          const { data: updated, error: updateError } = await supabaseAdmin
            .from('students')
            .update({
              first_name: firstName,
              last_name: lastName,
              date_of_birth: validatedData.child_date_of_birth || null,
              medical_conditions: validatedData.medical_conditions || null,
            })
            .eq('id', id)
            .eq('parent_id', parent.id)
            .select()
            .single();

          if (updateError) {
            console.error('Update student error:', updateError);
            return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
          }

          return NextResponse.json({
            id: updated.id,
            child_full_name: `${updated.first_name} ${updated.last_name}`.trim(),
            child_date_of_birth: updated.date_of_birth,
            medical_conditions: updated.medical_conditions,
            _source: 'students',
          });
        }
      }
    }

    // Check signed_waivers table
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, clerk_user_id')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .neq('is_active', false)
      .single();

    if (existing) {
      // Build update object with validated data
    const updateData: Record<string, string | null> = {
      child_full_name: validatedData.child_full_name,
    };

    // Add optional fields if provided (already sanitized by schema)
    if (validatedData.child_date_of_birth !== undefined) {
      updateData.child_date_of_birth = validatedData.child_date_of_birth || null;
    }
    if (validatedData.child_gender !== undefined) {
      updateData.child_gender = validatedData.child_gender || null;
    }
    if (validatedData.medical_conditions !== undefined) {
      updateData.medical_conditions = validatedData.medical_conditions || null;
    }
    if (validatedData.allergies !== undefined) {
      updateData.allergies = validatedData.allergies || null;
    }
    if (validatedData.emergency_contact_name !== undefined) {
      updateData.emergency_contact_name = validatedData.emergency_contact_name || null;
    }
    if (validatedData.emergency_contact_phone !== undefined) {
      updateData.emergency_contact_phone = validatedData.emergency_contact_phone || null;
    }
    if (validatedData.emergency_contact_relationship !== undefined) {
      updateData.emergency_contact_relationship = validatedData.emergency_contact_relationship || null;
    }

    // Update signed_waivers table
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

    // SYNC: Update linked enrollment record
    const { firstName, lastName } = splitFullName(validatedData.child_full_name);
    const syncData: WaiverToEnrollmentData = {
      child_first_name: firstName,
      child_last_name: lastName,
      child_date_of_birth: validatedData.child_date_of_birth || null,
      emergency_contact_name: validatedData.emergency_contact_name || null,
      emergency_contact_phone: validatedData.emergency_contact_phone || null,
    };

    const syncResult = await syncWaiverToEnrollment(
      id,
      userId,
      existing.child_full_name, // Use OLD name for lookup
      syncData
    );

    // Log sync warnings but don't fail the request
    if (syncResult.warnings.length > 0) {
      console.log('Sync warnings:', syncResult.warnings);
    }
    if (syncResult.errors.length > 0) {
      console.error('Sync errors (non-blocking):', syncResult.errors);
    }

      return NextResponse.json({
        ...student,
        _sync: {
          success: syncResult.success,
          syncedTables: syncResult.syncedTables,
        },
      });
    }

    // Student not found in any table
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
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

    // Validate UUID format to prevent injection
    if (!PATTERNS.uuid.test(id)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    // Get request body for reason
    let reason = 'Parent requested removal';
    try {
      const body = await request.json();
      if (body.reason && typeof body.reason === 'string') {
        // Sanitize reason - limit length and remove dangerous chars
        reason = body.reason.slice(0, 500).replace(/<[^>]*>/g, '').trim() || reason;
      }
    } catch {
      // No body provided, use default reason
    }

    // Get user and parent info first
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    // First, check students table
    if (dbUser) {
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id, first_name, last_name, phone')
        .eq('user_id', dbUser.id)
        .single();

      if (parent) {
        const { data: studentRecord } = await supabaseAdmin
          .from('students')
          .select('id, first_name, last_name, is_active')
          .eq('id', id)
          .eq('parent_id', parent.id)
          .neq('is_active', false)
          .single();

        if (studentRecord) {
          // Soft delete from students table
          const { error: updateError } = await supabaseAdmin
            .from('students')
            .update({
              is_active: false,
            })
            .eq('id', id)
            .eq('parent_id', parent.id);

          if (updateError) {
            console.error('Soft delete student error:', updateError);
            return NextResponse.json({ error: 'Failed to remove student' }, { status: 500 });
          }

          return NextResponse.json({ 
            success: true, 
            message: 'Student removed successfully',
          });
        }
      }
    }

    // Check signed_waivers table
    const { data: existing } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, clerk_user_id, guardian_full_name, guardian_email')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .neq('is_active', false)
      .single();

    if (existing) {
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

      // SYNC: Update linked enrollment to cancelled status
      const syncResult = await syncWaiverDeactivation(
        id,
        userId,
        existing.child_full_name,
        reason
      );

      if (syncResult.errors.length > 0) {
        console.error('Deactivation sync errors (non-blocking):', syncResult.errors);
      }

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
        enrollment_synced: syncResult.syncedTables.includes('enrollments'),
      },
      priority: 'normal',
    });

      return NextResponse.json({ 
        success: true, 
        message: 'Student removed successfully',
        _sync: {
          success: syncResult.success,
          syncedTables: syncResult.syncedTables,
        },
      });
    }

    // Student not found in any table
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
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

    // Validate UUID format to prevent injection
    if (!PATTERNS.uuid.test(id)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate action field
    if (typeof body.action !== 'string' || !['reactivate'].includes(body.action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (body.action === 'reactivate') {
      // First, check students table
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();

      if (dbUser) {
        const { data: parent } = await supabaseAdmin
          .from('parents')
          .select('id')
          .eq('user_id', dbUser.id)
          .single();

        if (parent) {
          const { data: studentRecord } = await supabaseAdmin
            .from('students')
            .select('id, first_name, last_name, is_active')
            .eq('id', id)
            .eq('parent_id', parent.id)
            .single();

          if (studentRecord) {
            if (studentRecord.is_active) {
              return NextResponse.json({ error: 'Student is already active' }, { status: 400 });
            }

            const { error: updateError } = await supabaseAdmin
              .from('students')
              .update({ is_active: true })
              .eq('id', id)
              .eq('parent_id', parent.id);

            if (updateError) {
              return NextResponse.json({ error: 'Failed to reactivate student' }, { status: 500 });
            }

            return NextResponse.json({ 
              success: true, 
              message: 'Student reactivated successfully',
            });
          }
        }
      }

      // Check signed_waivers table
      const { data: existing } = await supabaseAdmin
        .from('signed_waivers')
        .select('id, is_active, child_full_name')
        .eq('id', id)
        .eq('clerk_user_id', userId)
        .single();

      if (existing) {
        if (existing.is_active) {
          return NextResponse.json({ error: 'Student is already active' }, { status: 400 });
        }

        // Reactivate in signed_waivers
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

        // SYNC: Reactivate linked enrollment
        const syncResult = await syncWaiverReactivation(
          id,
          userId,
          existing.child_full_name
        );

        if (syncResult.errors.length > 0) {
          console.error('Reactivation sync errors (non-blocking):', syncResult.errors);
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Student reactivated successfully',
          _sync: {
            success: syncResult.success,
            syncedTables: syncResult.syncedTables,
          },
        });
      }

      // Student not found in any table
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Patch student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
