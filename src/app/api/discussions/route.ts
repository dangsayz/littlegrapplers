import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';
import { z } from 'zod';

// Validation schema for creating a thread
const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(10000),
  locationId: z.string(),
});

// GET: Fetch threads for a specific location
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail === ADMIN_EMAIL;

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // If not admin, verify user has access to this location
    if (!isAdmin) {
      const hasAccess = await prisma.studentLocation.findFirst({
        where: {
          locationId,
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
        return NextResponse.json({ error: 'No access to this location' }, { status: 403 });
      }
    }

    const threads = await prisma.discussionThread.findMany({
      where: { locationId },
      include: {
        author: {
          select: {
            id: true,
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
          select: { id: true },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    // Format threads for response
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      createdAt: thread.createdAt,
      replyCount: thread.replies.length,
      author: {
        firstName: thread.author.parent?.firstName || 'Unknown',
        lastName: thread.author.parent?.lastName || 'User',
        isAdmin: thread.author.email === ADMIN_EMAIL,
      },
      location: thread.location,
    }));

    return NextResponse.json({ threads: formattedThreads });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

// POST: Create a new thread
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail === ADMIN_EMAIL;

    const body = await request.json();
    const parsed = createThreadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { title, content, locationId } = parsed.data;

    // If not admin, verify user has access to this location
    if (!isAdmin) {
      const hasAccess = await prisma.studentLocation.findFirst({
        where: {
          locationId,
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
        return NextResponse.json({ error: 'No access to this location' }, { status: 403 });
      }
    }

    // Get the internal user ID from email
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If user doesn't exist in our DB, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: userEmail!,
          passwordHash: '', // Clerk handles auth
          role: isAdmin ? 'admin' : 'parent',
        },
      });
    }

    const thread = await prisma.discussionThread.create({
      data: {
        title,
        content,
        locationId,
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

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
