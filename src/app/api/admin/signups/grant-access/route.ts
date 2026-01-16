import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { waiverId, locationId } = await request.json();

    if (!waiverId || !locationId) {
      return NextResponse.json({ error: 'Missing waiverId or locationId' }, { status: 400 });
    }

    // Get the waiver
    const { data: waiver, error: waiverError } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('id', waiverId)
      .single();

    if (waiverError || !waiver) {
      return NextResponse.json({ error: 'Waiver not found' }, { status: 404 });
    }

    // Verify location exists
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('id', locationId)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    let userId = waiver.user_id;

    // If no user_id, try to find or create user
    if (!userId) {
      // Check if user exists by clerk_user_id
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', waiver.clerk_user_id)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Check by email
        const { data: userByEmail } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', waiver.guardian_email)
          .maybeSingle();

        if (userByEmail) {
          userId = userByEmail.id;
          // Link clerk_user_id
          await supabaseAdmin
            .from('users')
            .update({ clerk_user_id: waiver.clerk_user_id })
            .eq('id', userId);
        } else {
          // Create new user from waiver data
          const nameParts = waiver.guardian_full_name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              clerk_user_id: waiver.clerk_user_id,
              email: waiver.guardian_email,
              first_name: firstName,
              last_name: lastName,
              phone: waiver.guardian_phone,
              status: 'active',
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
          }
          userId = newUser.id;
        }
      }

      // Update waiver with user_id
      await supabaseAdmin
        .from('signed_waivers')
        .update({ user_id: userId })
        .eq('id', waiverId);
    }

    // Update waiver with location_id if not set
    if (!waiver.location_id || waiver.location_id !== locationId) {
      await supabaseAdmin
        .from('signed_waivers')
        .update({ location_id: locationId })
        .eq('id', waiverId);
    }

    // Add user to user_locations (upsert to avoid duplicates)
    const { error: userLocationError } = await supabaseAdmin
      .from('user_locations')
      .upsert({
        user_id: userId,
        location_id: locationId,
      }, {
        onConflict: 'user_id,location_id',
      });

    if (userLocationError) {
      console.error('Error adding user to location:', userLocationError);
      return NextResponse.json({ error: 'Failed to grant location access' }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'admin.grant_location_access',
      entity_type: 'user',
      entity_id: userId,
      details: {
        waiver_id: waiverId,
        location_id: locationId,
        location_name: location.name,
        guardian_email: waiver.guardian_email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Access granted to ${location.name}`,
      userId,
      locationId,
    });
  } catch (error) {
    console.error('Grant access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
