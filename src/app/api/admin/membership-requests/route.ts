import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

// GET: Fetch all pending membership requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Fetch membership requests
    const { data: requests, error } = await supabaseAdmin
      .from('membership_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user and location details
    const userIds = [...new Set((requests || []).map(r => r.user_id))];
    const locationIds = [...new Set((requests || []).map(r => r.location_id))];

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', userIds.length > 0 ? userIds : ['none']);

    const { data: locations } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug')
      .in('id', locationIds.length > 0 ? locationIds : ['none']);

    const userMap = new Map((users || []).map(u => [u.id, u]));
    const locationMap = new Map((locations || []).map(l => [l.id, l]));

    const formattedRequests = (requests || []).map(r => {
      const requestUser = userMap.get(r.user_id);
      const requestLocation = locationMap.get(r.location_id);
      return {
        id: r.id,
        status: r.status,
        message: r.message,
        createdAt: r.created_at,
        user: {
          id: r.user_id,
          name: `${requestUser?.first_name || 'Unknown'} ${requestUser?.last_name || ''}`.trim(),
          email: requestUser?.email || 'unknown',
        },
        location: {
          id: r.location_id,
          name: requestLocation?.name || 'Unknown',
          slug: requestLocation?.slug,
        },
      };
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching membership requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
