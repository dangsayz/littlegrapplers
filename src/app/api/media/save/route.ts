import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      fileUrl,
      filePath,
      fileType,
      fileSize,
      mimeType,
      allLocations,
      locationIds,
    } = body;

    if (!fileUrl || !filePath) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 });
    }

    // Save media record to database
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('media')
      .insert({
        title: title || 'Untitled',
        description,
        file_url: fileUrl,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        mime_type: mimeType,
        uploaded_by: userEmail,
        all_locations: allLocations,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 });
    }

    // Save location assignments if not all locations
    if (!allLocations && locationIds?.length > 0) {
      await supabaseAdmin.from('media_locations').insert(
        locationIds.map((locationId: string) => ({
          media_id: mediaRecord.id,
          location_id: locationId,
        }))
      );
    }

    return NextResponse.json({ 
      media: mediaRecord,
    }, { status: 201 });
  } catch (error) {
    console.error('Media save error:', error);
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 });
  }
}
