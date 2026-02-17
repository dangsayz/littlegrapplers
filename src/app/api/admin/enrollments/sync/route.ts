import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const result = {
      synced: 0,
      fixed: 0,
      errors: [] as string[],
    };

    // 1. Check for enrollments with payment but no active status
    const { data: paidEnrollments, error: paidError } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, stripe_checkout_session_id, guardian_email, child_first_name, child_last_name')
      .not('stripe_checkout_session_id', 'is', null)
      .in('status', ['pending', 'pending_payment', 'approved']);

    if (paidError) {
      result.errors.push(`Failed to query paid enrollments: ${paidError.message}`);
    } else if (paidEnrollments) {
      result.synced += paidEnrollments.length;
      
      // Update paid enrollments to active status
      for (const enrollment of paidEnrollments) {
        const { error: updateError } = await supabaseAdmin
          .from('enrollments')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollment.id);

        if (updateError) {
          result.errors.push(`Failed to update ${enrollment.child_first_name} ${enrollment.child_last_name}: ${updateError.message}`);
        } else {
          result.fixed++;
        }
      }
    }

    // 2. Check for orphaned waivers without enrollments
    const { data: orphanedWaivers, error: waiverError } = await supabaseAdmin
      .from('signed_waivers')
      .select(`
        id,
        child_full_name,
        guardian_email,
        clerk_user_id
      `)
      .eq('is_active', true);

    if (waiverError) {
      result.errors.push(`Failed to query waivers: ${waiverError.message}`);
    } else if (orphanedWaivers) {
      for (const waiver of orphanedWaivers) {
        // Check if enrollment exists
        const { data: existingEnrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('guardian_email', waiver.guardian_email)
          .ilike('child_first_name', waiver.child_full_name.split(' ')[0] || '')
          .ilike('child_last_name', waiver.child_full_name.split(' ').slice(1).join(' ') || '')
          .single();

        if (!existingEnrollment) {
          result.errors.push(`Orphaned waiver found: ${waiver.child_full_name} (${waiver.guardian_email}) - no matching enrollment`);
        }
      }
    }

    // 3. Validate enrollment data integrity
    const { data: invalidEnrollments, error: invalidError } = await supabaseAdmin
      .from('enrollments')
      .select('id, guardian_email, child_first_name, child_last_name')
      .or('guardian_email.is.null,child_first_name.is.null,child_last_name.is.null');

    if (invalidError) {
      result.errors.push(`Failed to validate enrollment data: ${invalidError.message}`);
    } else if (invalidEnrollments && invalidEnrollments.length > 0) {
      result.errors.push(`Found ${invalidEnrollments.length} enrollments with missing required data`);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Enrollment sync error:', error);
    return NextResponse.json(
      { 
        synced: 0, 
        fixed: 0, 
        errors: ['Internal server error'] 
      }, 
      { status: 500 }
    );
  }
}
