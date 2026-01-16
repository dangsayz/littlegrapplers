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

    // Get all signed waivers with location_id set
    const { data: waivers, error: waiversError } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .not('location_id', 'is', null);

    if (waiversError) {
      console.error('Error fetching waivers:', waiversError);
      return NextResponse.json({ error: 'Failed to fetch waivers' }, { status: 500 });
    }

    let synced = 0;
    let created = 0;
    let errors: string[] = [];

    for (const waiver of waivers || []) {
      try {
        let userId = waiver.user_id;

        // Find or create user
        if (!userId) {
          // Check by clerk_user_id
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
              // Create new user
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
                errors.push(`Failed to create user for ${waiver.guardian_email}: ${createError.message}`);
                continue;
              }
              userId = newUser.id;
              created++;
            }
          }

          // Update waiver with user_id
          await supabaseAdmin
            .from('signed_waivers')
            .update({ user_id: userId })
            .eq('id', waiver.id);
        }

        // Add to user_locations
        const { error: locationError } = await supabaseAdmin
          .from('user_locations')
          .upsert({
            user_id: userId,
            location_id: waiver.location_id,
          }, {
            onConflict: 'user_id,location_id',
          });

        if (locationError) {
          errors.push(`Failed to add ${waiver.guardian_email} to location: ${locationError.message}`);
          continue;
        }

        synced++;
      } catch (err) {
        errors.push(`Error processing waiver ${waiver.id}: ${err}`);
      }
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'admin.sync_all_signups',
      entity_type: 'system',
      entity_id: 'bulk_sync',
      details: {
        total_waivers: waivers?.length || 0,
        synced,
        users_created: created,
        errors: errors.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} signups to their locations`,
      stats: {
        total: waivers?.length || 0,
        synced,
        usersCreated: created,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Sync all error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
