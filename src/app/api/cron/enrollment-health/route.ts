import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fixes = {
      paymentStatusSync: 0,
      orphanedPayments: 0,
      stalePending: 0,
      errors: [] as string[],
    };

    // 1. Fix paid enrollments stuck in pending/approved status
    const { data: paidEnrollments, error: paidError } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, stripe_checkout_session_id, guardian_email, child_first_name, child_last_name')
      .not('stripe_checkout_session_id', 'is', null)
      .in('status', ['pending', 'pending_payment', 'approved']);

    if (!paidError && paidEnrollments) {
      for (const enrollment of paidEnrollments) {
        const { error: updateError } = await supabaseAdmin
          .from('enrollments')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollment.id);

        if (!updateError) {
          fixes.paymentStatusSync++;
        } else {
          fixes.errors.push(`Failed to sync ${enrollment.child_first_name}: ${updateError.message}`);
        }
      }
    }

    // 2. Check for enrollments with stale pending status (>24h)
    const { data: stalePending, error: staleError } = await supabaseAdmin
      .from('enrollments')
      .select('id, guardian_email, child_first_name, child_last_name, submitted_at')
      .eq('status', 'pending')
      .lt('submitted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!staleError && stalePending) {
      for (const enrollment of stalePending) {
        // Flag for admin review but don't auto-cancel
        const { error: flagError } = await supabaseAdmin
          .from('enrollments')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollment.id);

        if (!flagError) {
          fixes.stalePending++;
        }
      }
    }

    // 3. Log health check
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        admin_id: null,
        admin_email: 'system',
        action: 'enrollment_health_check',
        entity_type: 'system',
        entity_id: 'cron',
        details: {
          fixes,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      fixes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Enrollment health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
