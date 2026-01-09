import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, allLocations, locationIds } = body;

    // Update media record
    const { data: media, error } = await supabaseAdmin
      .from('media')
      .update({
        title,
        description,
        all_locations: allLocations,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
    }

    // Update location assignments if provided
    if (typeof allLocations !== 'undefined') {
      // Delete existing location assignments
      await supabaseAdmin
        .from('media_locations')
        .delete()
        .eq('media_id', id);

      // Add new location assignments if not all locations
      if (!allLocations && locationIds?.length > 0) {
        await supabaseAdmin.from('media_locations').insert(
          locationIds.map((locationId: string) => ({
            media_id: id,
            location_id: locationId,
          }))
        );
      }
    }

    // Fetch updated media with locations
    const { data: updatedMedia } = await supabaseAdmin
      .from('media')
      .select(`
        *,
        media_locations (
          location_id,
          locations (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({ media: updatedMedia || media });
  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}
