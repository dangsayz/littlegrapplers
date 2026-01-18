import { supabaseAdmin } from '@/lib/supabase';

// Type definitions for database records
interface SubscriptionRecord {
  id: string;
  clerk_user_id: string | null;
  enrollment_id: string | null;
  status: string;
  plan_name: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  updated_at: string | null;
}

interface EnrollmentRecord {
  id: string;
  status: string;
  reviewed_at: string | null;
  submitted_at: string | null;
}

/**
 * Sync enrollment status with subscription status
 * This ensures that the enrollment table reflects the actual payment status
 */
export async function syncEnrollmentStatusWithSubscription() {
  try {
    
    // Get all active subscriptions
    const { data: activeSubscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, clerk_user_id, enrollment_id, status, current_period_end, updated_at')
      .eq('status', 'active');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return { success: false, error: subError };
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      console.log('No active subscriptions found');
      return { success: true, message: 'No active subscriptions to sync' };
    }

    let updatedCount = 0;

    // For each active subscription, ensure corresponding enrollment is active
    for (const subscription of activeSubscriptions) {
      // Skip if no clerk_user_id (shouldn't happen but be safe)
      if (!subscription.clerk_user_id) {
        console.warn(`Subscription ${subscription.id} has no clerk_user_id`);
        continue;
      }
      
      // First try to find by enrollment_id if available
      let query = supabaseAdmin
        .from('enrollments')
        .select('id, status, reviewed_at');
      
      if (subscription.enrollment_id) {
        query = query.eq('id', subscription.enrollment_id);
      } else {
        query = query.eq('clerk_user_id', subscription.clerk_user_id);
      }
      
      const { data: enrollments, error: enrollmentError } = await query
        .in('status', ['pending', 'approved']);

      if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError);
        continue;
      }

      if (enrollments && enrollments.length > 0) {
        // Update enrollment to active status
        for (const enrollment of enrollments) {
          const { error: updateError } = await supabaseAdmin
            .from('enrollments')
            .update({
              status: 'active',
              reviewed_at: new Date().toISOString(),
            })
            .eq('id', enrollment.id);

          if (updateError) {
            console.error(`Failed to update enrollment ${enrollment.id}:`, updateError);
          } else {
            console.log(`Updated enrollment ${enrollment.id} to active for user ${subscription.clerk_user_id}`);
            updatedCount++;
          }
        }
      }
    }

    // Now handle cancelled/expired subscriptions
    const { data: cancelledSubscriptions, error: cancelledError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, clerk_user_id, enrollment_id, status')
      .in('status', ['canceled', 'expired', 'past_due']);

    if (cancelledError) {
      console.error('Error fetching cancelled subscriptions:', cancelledError);
    } else if (cancelledSubscriptions) {
      for (const subscription of cancelledSubscriptions) {
        if (!subscription.clerk_user_id && !subscription.enrollment_id) {
          continue;
        }
        
        // Build query based on available identifiers
        let cancelQuery = supabaseAdmin
          .from('enrollments')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          });
        
        if (subscription.enrollment_id) {
          cancelQuery = cancelQuery.eq('id', subscription.enrollment_id);
        } else {
          cancelQuery = cancelQuery.eq('clerk_user_id', subscription.clerk_user_id);
        }
        
        const { error: cancelUpdateError, count } = await cancelQuery
          .eq('status', 'active');

        if (cancelUpdateError) {
          console.error(`Failed to cancel enrollment for subscription ${subscription.id}:`, cancelUpdateError);
        } else if (count && count > 0) {
          console.log(`Cancelled ${count} enrollment(s) for subscription ${subscription.id}`);
          updatedCount += count;
        }
      }
    }

    return { 
      success: true, 
      message: `Synced ${updatedCount} enrollment records with subscription status` 
    };

  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error };
  }
}

/**
 * Get membership status by checking both subscriptions and enrollments
 * This provides a unified view of membership status
 */
export async function getUnifiedMembershipStatus(clerkUserId: string) {
  try {
    // Check subscription status first
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('status, plan_name, current_period_start, current_period_end')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Check enrollment status
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('status, submitted_at, reviewed_at')
      .eq('clerk_user_id', clerkUserId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    return {
      subscription: subscription || null,
      enrollment: enrollment || null,
      hasSubscription: !!subscription && !subError,
      hasEnrollment: !!enrollment && !enrollError,
      // Unified status logic
      unifiedStatus: getUnifiedStatus(subscription?.status, enrollment?.status),
    };
  } catch (error) {
    console.error('Error getting unified membership status:', error);
    return {
      subscription: null,
      enrollment: null,
      hasSubscription: false,
      hasEnrollment: false,
      unifiedStatus: 'error',
    };
  }
}

function getUnifiedStatus(subscriptionStatus?: string, enrollmentStatus?: string): string {
  // If subscription is active, consider member active regardless of enrollment status
  if (subscriptionStatus === 'active') {
    return 'active';
  }
  
  // If subscription is cancelled, consider member cancelled
  if (['canceled', 'expired', 'past_due'].includes(subscriptionStatus || '')) {
    return 'cancelled';
  }
  
  // If no subscription but enrollment is active, they might be on a one-time plan
  if (!subscriptionStatus && enrollmentStatus === 'active') {
    return 'active';
  }
  
  // If no subscription but enrollment is pending/approved, they need to pay
  if (!subscriptionStatus && ['pending', 'approved'].includes(enrollmentStatus || '')) {
    return 'pending_payment';
  }
  
  // Default to enrollment status if no subscription
  return enrollmentStatus || 'unknown';
}
