import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const threadId = formData.get('threadId') as string | null;
    const replyId = formData.get('replyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!threadId && !replyId) {
      return NextResponse.json({ error: 'Must provide threadId or replyId' }, { status: 400 });
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max ${isVideo ? '100MB' : '10MB'}` 
      }, { status: 400 });
    }

    // Get user from database
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('discussion-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('discussion-media')
      .getPublicUrl(fileName);

    // Save to media_attachments table
    const { data: attachment, error: dbError } = await supabaseAdmin
      .from('media_attachments')
      .insert({
        thread_id: threadId || null,
        reply_id: replyId || null,
        uploader_id: dbUser.id,
        file_url: urlData.publicUrl,
        file_type: isVideo ? 'video' : 'image',
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select('id, file_url, file_type, file_name')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete the uploaded file if DB insert fails
      await supabaseAdmin.storage.from('discussion-media').remove([fileName]);
      return NextResponse.json({ error: 'Failed to save attachment' }, { status: 500 });
    }

    return NextResponse.json({
      id: attachment.id,
      url: attachment.file_url,
      type: attachment.file_type,
      name: attachment.file_name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
