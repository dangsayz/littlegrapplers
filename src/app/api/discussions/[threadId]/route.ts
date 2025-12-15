import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';

// GET: Fetch a single thread with replies
export async function GET(
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
    const isAdmin = userEmail === ADMIN_EMAIL;

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: {
            email: true,
            parent: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        replies: {
          include: {
            author: {
              select: {
                email: true,
                parent: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // If not admin, verify user has access to this location
    if (!isAdmin) {
      const hasAccess = await prisma.studentLocation.findFirst({
        where: {
          locationId: thread.locationId,
          student: {
            parent: {
              user: {
                email: userEmail,
              },
            },
          },
        },
      });

      if (!hasAccess) {
        return NextResponse.json({ error: 'No access to this thread' }, { status: 403 });
      }
    }

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

// DELETE: Delete a thread (admin or author only)
export async function DELETE(
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
    const isAdmin = userEmail === ADMIN_EMAIL;

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: { email: true },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Only admin or author can delete
    if (!isAdmin && thread.author.email !== userEmail) {
      return NextResponse.json({ error: 'Not authorized to delete' }, { status: 403 });
    }

    await prisma.discussionThread.delete({
      where: { id: threadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
