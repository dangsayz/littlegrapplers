import { supabaseAdmin } from './supabase';

export interface EnrollmentHealth {
  totalChecked: number;
  issuesFixed: number;
  errors: string[];
}

/**
 * Proactive enrollment health monitor
 * Runs automatically to fix enrollment issues before parents notice
 */
export async function runEnrollmentHealthCheck(): Promise<EnrollmentHealth> {
  const health = {
    totalChecked: 0,
    issuesFixed: 0,
    errors: [] as string[],
  };

  try {
    // 1. Fix paid enrollments stuck in wrong status
    const { data: paidEnrollments, error: paidError } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, stripe_checkout_session_id, child_first_name, child_last_name')
      .not('stripe_checkout_session_id', 'is', null)
      .in('status', ['pending', 'pending_payment', 'approved']);

    if (!paidError && paidEnrollments) {
      health.totalChecked += paidEnrollments.length;
      
      for (const enrollment of paidEnrollments) {
        const { error: updateError } = await supabaseAdmin
          .from('enrollments')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollment.id);

        if (!updateError) {
          health.issuesFixed++;
          console.log(`Auto-fixed enrollment: ${enrollment.child_first_name} ${enrollment.child_last_name}`);
        } else {
          health.errors.push(`Failed to fix ${enrollment.child_first_name}: ${updateError.message}`);
        }
      }
    }

    // 2. Check for webhook failures and retry
    const { data: failedWebhooks, error: webhookError } = await supabaseAdmin
      .from('webhook_events')
      .select('*')
      .eq('processing_status', 'failed')
      .eq('event_type', 'checkout.session.completed')
      .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .limit(10);

    if (!webhookError && failedWebhooks) {
      for (const webhook of failedWebhooks) {
        try {
          const session = webhook.event_data;
          const enrollmentId = session.metadata?.enrollment_id;

          if (enrollmentId) {
            const { error: retryError } = await supabaseAdmin
              .from('enrollments')
              .update({
                status: 'active',
                stripe_checkout_session_id: session.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', enrollmentId);

            if (!retryError) {
              // Mark webhook as processed
              await supabaseAdmin
                .from('webhook_events')
                .update({
                  processing_status: 'success',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', webhook.id);

              health.issuesFixed++;
              console.log(`Retried and fixed webhook for enrollment: ${enrollmentId}`);
            }
          }
        } catch (error) {
          health.errors.push(`Failed to retry webhook ${webhook.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // 3. Log health check results
    if (health.issuesFixed > 0 || health.errors.length > 0) {
      await supabaseAdmin
        .from('activity_logs')
        .insert({
          admin_id: null,
          admin_email: 'system',
          action: 'auto_enrollment_heal',
          entity_type: 'system',
          entity_id: 'monitor',
          details: health,
          created_at: new Date().toISOString(),
        });
    }

    return health;
  } catch (error) {
    health.errors.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return health;
  }
}
