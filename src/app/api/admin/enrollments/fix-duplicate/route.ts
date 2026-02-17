import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { guardianEmail, childFirstName, childLastName, locationId } = await request.json();

    if (!guardianEmail || !childFirstName || !childLastName || !locationId) {
      return NextResponse.json(
        { error: 'Missing required fields: guardianEmail, childFirstName, childLastName, locationId' },
        { status: 400 }
      );
    }

    // Find all enrollments for this child
    const { data: enrollments, error: findError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('guardian_email', guardianEmail)
      .eq('child_first_name', childFirstName)
      .eq('child_last_name', childLastName)
      .eq('location_id', locationId)
      .order('submitted_at', { ascending: false });

    if (findError) {
      return NextResponse.json(
        { error: 'Failed to find enrollments' },
        { status: 500 }
      );
    }

    if (!enrollments || enrollments.length <= 1) {
      return NextResponse.json({
        message: 'No duplicate enrollments found',
        enrollments: enrollments || [],
      });
    }

    // Keep the most recent enrollment, mark others as cancelled
    const [keepEnrollment, ...duplicateEnrollments] = enrollments;
    
    let fixedCount = 0;
    const errors: string[] = [];

    // Cancel duplicate enrollments
    for (const duplicate of duplicateEnrollments) {
      const { error: cancelError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'cancelled',
          cancellation_reason: 'Duplicate enrollment - merged with newer record',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', duplicate.id);

      if (cancelError) {
        errors.push(`Failed to cancel enrollment ${duplicate.id}: ${cancelError.message}`);
      } else {
        fixedCount++;
      }
    }

    // Ensure the kept enrollment has the correct status
    if (keepEnrollment.stripe_checkout_session_id && keepEnrollment.status !== 'active') {
      const { error: statusError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', keepEnrollment.id);

      if (statusError) {
        errors.push(`Failed to update kept enrollment status: ${statusError.message}`);
      }
    }

    return NextResponse.json({
      message: `Fixed ${fixedCount} duplicate enrollments`,
      keepEnrollment,
      cancelledEnrollments: duplicateEnrollments.length,
      errors,
    });
  } catch (error) {
    console.error('Fix duplicate enrollments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
