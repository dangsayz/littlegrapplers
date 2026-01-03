import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const locationId = searchParams.get('locationId');

    const now = new Date();

    const where: Record<string, unknown> = {
      publishAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    };

    if (type) {
      where.type = type;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        studentOfMonth: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            beltRank: true,
          },
        },
        programs: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                location: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { publishAt: 'desc' },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

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
    const { title, content, type, studentOfMonthId, publishAt, expiresAt, programIds } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'general',
        studentOfMonthId: studentOfMonthId || null,
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        programs: programIds?.length
          ? {
              create: programIds.map((programId: string) => ({
                programId,
              })),
            }
          : undefined,
      },
      include: {
        studentOfMonth: true,
        programs: {
          include: {
            program: true,
          },
        },
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
