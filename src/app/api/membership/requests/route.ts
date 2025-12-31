import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to create admin notification
async function createAdminNotification(data: {
  notification_type: string;
  user_id?: string;
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

// GET /api/membership/requests - Get user's membership requests
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: requests, error } = await supabaseAdmin
      .from('membership_requests')
      .select('*')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch requests error:', error);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error('Get membership requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/membership/requests - Create new membership request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestType, reason, additionalComments, pauseStartDate, pauseEndDate, subscriptionId, studentId } = body;

    // Validate request type
    const validTypes = ['cancel', 'pause', 'resume', 'change_plan', 'remove_student'];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // Validate reason
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Validate pause dates if pause request
    if (requestType === 'pause') {
      if (!pauseStartDate || !pauseEndDate) {
        return NextResponse.json({ error: 'Start and end dates are required for pause requests' }, { status: 400 });
      }

      const startDate = new Date(pauseStartDate);
      const endDate = new Date(pauseEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
      }

      if (endDate <= startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
      }

      // Max pause duration: 90 days
      const maxPauseDays = 90;
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > maxPauseDays) {
        return NextResponse.json({ error: `Pause duration cannot exceed ${maxPauseDays} days` }, { status: 400 });
      }
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing pending request of same type
    const { data: existingRequest } = await supabaseAdmin
      .from('membership_requests')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('request_type', requestType)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending request of this type. Please wait for it to be processed or withdraw it first.',
        existingRequestId: existingRequest.id,
      }, { status: 400 });
    }

    // Get subscription info if provided
    let currentPlan = null;
    if (subscriptionId) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('plan_name, status')
        .eq('id', subscriptionId)
        .eq('clerk_user_id', userId)
        .single();
      
      if (subscription) {
        currentPlan = subscription.plan_name;
      }
    }

    // Create the request
    const { data: newRequest, error: insertError } = await supabaseAdmin
      .from('membership_requests')
      .insert({
        user_id: dbUser.id,
        clerk_user_id: userId,
        subscription_id: subscriptionId || null,
        student_id: studentId || null,
        request_type: requestType,
        pause_start_date: pauseStartDate || null,
        pause_end_date: pauseEndDate || null,
        current_plan: currentPlan,
        reason: reason.trim(),
        additional_comments: additionalComments?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert request error:', insertError);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    // Create admin notification
    const notificationTypeMap: Record<string, string> = {
      cancel: 'membership_cancel_request',
      pause: 'membership_pause_request',
      resume: 'membership_change_request',
      change_plan: 'membership_change_request',
      remove_student: 'student_removal_request',
    };

    const titleMap: Record<string, string> = {
      cancel: 'Membership Cancellation Request',
      pause: 'Membership Pause Request',
      resume: 'Membership Resume Request',
      change_plan: 'Plan Change Request',
      remove_student: 'Student Removal Request',
    };

    const userName = `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email;

    await createAdminNotification({
      notification_type: notificationTypeMap[requestType],
      user_id: dbUser.id,
      request_id: newRequest.id,
      title: titleMap[requestType],
      message: `${userName} submitted a ${requestType.replace('_', ' ')} request. Reason: ${reason}`,
      metadata: {
        request_type: requestType,
        user_name: userName,
        user_email: dbUser.email,
        reason: reason,
        pause_start_date: pauseStartDate,
        pause_end_date: pauseEndDate,
      },
      priority: requestType === 'cancel' ? 'high' : 'normal',
    });

    return NextResponse.json({ 
      success: true, 
      request: newRequest,
      message: 'Your request has been submitted and is pending review.',
    });
  } catch (error) {
    console.error('Create membership request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
