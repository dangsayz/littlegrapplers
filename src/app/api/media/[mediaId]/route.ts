import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

// DELETE: Remove a media attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaId } = await params;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

    // Get media attachment to check ownership
    const { data: media, error: mediaError } = await supabaseAdmin
      .from('media_attachments')
      .select('id, thread_id, reply_id, file_url')
      .eq('id', mediaId)
      .single();

    if (mediaError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check if user owns the thread or reply this media belongs to
    let isOwner = false;

    if (media.thread_id) {
      const { data: thread } = await supabaseAdmin
        .from('discussion_threads')
        .select('author_email')
        .eq('id', media.thread_id)
        .single();
      
      isOwner = thread?.author_email === userEmail;
    } else if (media.reply_id) {
      const { data: reply } = await supabaseAdmin
        .from('discussion_replies')
        .select('author_email')
        .eq('id', media.reply_id)
        .single();
      
      isOwner = reply?.author_email === userEmail;
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this media' }, { status: 403 });
    }

    // Delete from Supabase storage if URL contains supabase
    if (media.file_url && media.file_url.includes('supabase')) {
      try {
        const urlParts = media.file_url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // Get bucket/path
        await supabaseAdmin.storage.from('media').remove([fileName]);
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
      }
    }

    // Delete media record from database
    const { error: deleteError } = await supabaseAdmin
      .from('media_attachments')
      .delete()
      .eq('id', mediaId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
