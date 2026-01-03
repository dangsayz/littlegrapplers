import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true';

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (isPublic) {
      where.isPublic = true;
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
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
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
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
    const { title, description, videoUrl, thumbnailUrl, duration, category, isPublic, programIds } = body;

    if (!title || !videoUrl || !category) {
      return NextResponse.json(
        { error: 'Title, video URL, and category are required' },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration: duration ? parseInt(duration, 10) : null,
        category,
        isPublic: isPublic || false,
        programs: programIds?.length
          ? {
              create: programIds.map((programId: string) => ({
                programId,
              })),
            }
          : undefined,
      },
      include: {
        programs: {
          include: {
            program: true,
          },
        },
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
