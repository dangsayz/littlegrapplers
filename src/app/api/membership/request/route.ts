import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

// POST: Request to join a location
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const clerkUserId = user.id;

    const body = await request.json();
    const { locationId, message } = body;

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Get or create user in Supabase
    let { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!dbUser) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: userEmail,
          first_name: user.firstName || 'Unknown',
          last_name: user.lastName || 'User',
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      dbUser = newUser;
    }

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from('location_members')
      .select('id')
      .eq('user_id', dbUser.id)
      .eq('location_id', locationId)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member of this location' }, { status: 400 });
    }

    // Check if already has pending request
    const { data: existingRequest } = await supabaseAdmin
      .from('membership_requests')
      .select('id, status')
      .eq('user_id', dbUser.id)
      .eq('location_id', locationId)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json({ error: 'Request already pending' }, { status: 400 });
      }
      if (existingRequest.status === 'rejected') {
        // Allow re-request after rejection
        await supabaseAdmin
          .from('membership_requests')
          .update({ status: 'pending', message, updated_at: new Date().toISOString() })
          .eq('id', existingRequest.id);
        
        return NextResponse.json({ success: true, message: 'Request resubmitted' });
      }
    }

    // Create membership request
    const { error: requestError } = await supabaseAdmin
      .from('membership_requests')
      .insert({
        user_id: dbUser.id,
        location_id: locationId,
        message,
      });

    if (requestError) throw requestError;

    // Get location name for notification
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .single();

    // Create notification for admin
    await supabaseAdmin.from('notifications').insert({
      type: 'membership_request',
      title: 'New Membership Request',
      message: `${user.firstName || userEmail} requested to join ${location?.name || 'a location'}`,
      data: {
        user_id: dbUser.id,
        user_email: userEmail,
        user_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail,
        location_id: locationId,
        location_name: location?.name,
      },
    });

    // Send email notification to admin
    await sendAdminEmailNotificationHelper({
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail!,
      userEmail: userEmail!,
      locationName: location?.name || 'Unknown Location',
      message,
    });

    return NextResponse.json({ success: true, message: 'Request submitted' });
  } catch (error) {
    console.error('Error creating membership request:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

// GET: Get user's membership requests
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUserId = user.id;

    // Get user from Supabase
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!dbUser) {
      return NextResponse.json({ requests: [] });
    }

    const { data: requests } = await supabaseAdmin
      .from('membership_requests')
      .select(`
        id,
        status,
        message,
        created_at,
        location_id
      `)
      .eq('user_id', dbUser.id);

    // Get location names
    const locationIds = (requests || []).map(r => r.location_id);
    const { data: locations } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .in('id', locationIds.length > 0 ? locationIds : ['none']);

    const locationMap = new Map((locations || []).map(l => [l.id, l.name]));

    const formattedRequests = (requests || []).map(r => ({
      id: r.id,
      status: r.status,
      message: r.message,
      createdAt: r.created_at,
      locationName: locationMap.get(r.location_id) || 'Unknown',
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching membership requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// Helper function to send email notification
async function sendAdminEmailNotificationHelper(data: {
  userName: string;
  userEmail: string;
  locationName: string;
  message?: string;
}) {
  try {
    const { sendAdminNotification, createMembershipRequestEmail } = await import('@/lib/email');
    const emailData = createMembershipRequestEmail(data);
    await sendAdminNotification(emailData);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}
