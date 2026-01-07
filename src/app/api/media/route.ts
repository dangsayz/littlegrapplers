import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'video', 'image', or null for all
    const locationId = searchParams.get('locationId'); // Filter by location

    let query = supabaseAdmin
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
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('file_type', type);
    }

    const { data: media, error } = await query;

    // If locationId is provided, filter to show only media for that location OR all_locations=true
    let filteredMedia = media || [];
    if (locationId && media) {
      filteredMedia = media.filter(item => 
        item.all_locations || 
        item.media_locations?.some((ml: { location_id: string }) => ml.location_id === locationId)
      );
    }

    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }

    return NextResponse.json({ media: filteredMedia });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    // Get the media record first to get file path
    const { data: media } = await supabaseAdmin
      .from('media')
      .select('file_path')
      .eq('id', id)
      .single();

    if (media?.file_path) {
      // Delete from storage
      await supabaseAdmin.storage
        .from('media')
        .remove([media.file_path]);
    }

    // Delete location assignments
    await supabaseAdmin
      .from('media_locations')
      .delete()
      .eq('media_id', id);

    // Delete media record
    const { error } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
