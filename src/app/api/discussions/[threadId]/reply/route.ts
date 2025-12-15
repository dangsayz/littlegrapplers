import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';
import { z } from 'zod';

const replySchema = z.object({
  content: z.string().min(1).max(5000),
});

// POST: Add a reply to a thread
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
    const isAdmin = userEmail === ADMIN_EMAIL;

    const body = await request.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { content } = parsed.data;

    // Get the thread to check location access and lock status
    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.isLocked) {
      return NextResponse.json({ error: 'Thread is locked' }, { status: 403 });
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

    // Get or create the user in our DB
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: userEmail!,
          passwordHash: '',
          role: isAdmin ? 'admin' : 'parent',
        },
      });
    }

    const reply = await prisma.discussionReply.create({
      data: {
        content,
        threadId,
        authorId: dbUser.id,
      },
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
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
