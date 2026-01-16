import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all signed waivers with location info
    const { data: waivers, error: waiversError } = await supabaseAdmin
      .from('signed_waivers')
      .select(`
        id,
        clerk_user_id,
        user_id,
        guardian_full_name,
        guardian_email,
        guardian_phone,
        child_full_name,
        child_date_of_birth,
        location_id,
        signed_at,
        created_at
      `)
      .order('signed_at', { ascending: false });

    if (waiversError) {
      console.error('Error fetching waivers:', waiversError);
      return NextResponse.json({ error: 'Failed to fetch waivers' }, { status: 500 });
    }

    // Get all locations
    const { data: locations } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug');

    const locationMap = new Map(locations?.map(l => [l.id, l]) || []);

    // Get all users to check account status
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, clerk_user_id, email, first_name, last_name, status');

    const userByClerkId = new Map(users?.map(u => [u.clerk_user_id, u]) || []);
    const userById = new Map(users?.map(u => [u.id, u]) || []);

    // Get user_locations to check location access
    const { data: userLocations } = await supabaseAdmin
      .from('user_locations')
      .select('user_id, location_id');

    const userLocationSet = new Set(
      userLocations?.map(ul => `${ul.user_id}:${ul.location_id}`) || []
    );

    // Get Stripe subscriptions to check payment status
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, status, stripe_subscription_id');

    const subscriptionByUserId = new Map(
      subscriptions?.map(s => [s.user_id, s]) || []
    );

    // Build unified signup records
    const signups = waivers?.map(waiver => {
      const dbUser = waiver.user_id 
        ? userById.get(waiver.user_id)
        : userByClerkId.get(waiver.clerk_user_id);
      
      const location = waiver.location_id ? locationMap.get(waiver.location_id) : null;
      const hasLocationAccess = dbUser && waiver.location_id 
        ? userLocationSet.has(`${dbUser.id}:${waiver.location_id}`)
        : false;
      const subscription = dbUser ? subscriptionByUserId.get(dbUser.id) : null;

      return {
        id: waiver.id,
        clerkUserId: waiver.clerk_user_id,
        dbUserId: dbUser?.id || null,
        guardianName: waiver.guardian_full_name,
        guardianEmail: waiver.guardian_email,
        guardianPhone: waiver.guardian_phone,
        childName: waiver.child_full_name,
        childDob: waiver.child_date_of_birth,
        signedAt: waiver.signed_at,
        // Status checks
        hasAccount: !!dbUser,
        accountStatus: dbUser?.status || null,
        locationId: waiver.location_id,
        locationName: location?.name || null,
        locationSlug: location?.slug || null,
        hasLocationAccess,
        hasPaid: subscription?.status === 'active' || subscription?.status === 'trialing',
        subscriptionStatus: subscription?.status || null,
      };
    }) || [];

    return NextResponse.json({
      signups,
      locations: locations || [],
      summary: {
        total: signups.length,
        withAccount: signups.filter(s => s.hasAccount).length,
        withLocationAccess: signups.filter(s => s.hasLocationAccess).length,
        withPayment: signups.filter(s => s.hasPaid).length,
        needsAttention: signups.filter(s => !s.hasLocationAccess || !s.locationId).length,
      },
    });
  } catch (error) {
    console.error('Admin signups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
