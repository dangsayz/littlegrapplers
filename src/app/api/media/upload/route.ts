import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

// Route segment config for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const allLocations = formData.get('allLocations') === 'true';
    const locationIds = formData.get('locationIds') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine file type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'Invalid file type. Only images and videos allowed.' }, { status: 400 });
    }

    // Server-side file size validation
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    const maxSize = isVideo ? maxVideoSize : maxImageSize;
    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Max ${limitMB}MB for ${isVideo ? 'videos' : 'images'}.` }, { status: 413 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const folder = isVideo ? 'videos' : 'images';
    const filePath = `${folder}/${filename}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save media record to database
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('media')
      .insert({
        title: title || file.name,
        description,
        file_url: fileUrl,
        file_path: filePath,
        file_type: isVideo ? 'video' : 'image',
        file_size: file.size,
        mime_type: file.type,
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
    if (!allLocations && locationIds) {
      const locations = JSON.parse(locationIds) as string[];
      if (locations.length > 0) {
        await supabaseAdmin.from('media_locations').insert(
          locations.map((locationId) => ({
            media_id: mediaRecord.id,
            location_id: locationId,
          }))
        );
      }
    }

    return NextResponse.json({ 
      media: mediaRecord,
      url: fileUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
