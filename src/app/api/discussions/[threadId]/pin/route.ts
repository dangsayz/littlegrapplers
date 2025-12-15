import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';

// POST: Toggle pin status (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    // Only admin can pin/unpin
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Only admin can pin threads' }, { status: 403 });
    }

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const updatedThread = await prisma.discussionThread.update({
      where: { id: threadId },
      data: { isPinned: !thread.isPinned },
    });

    return NextResponse.json({
      success: true,
      isPinned: updatedThread.isPinned,
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 });
  }
}
