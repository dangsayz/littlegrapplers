import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';

// GET: Fetch locations the current user has access to
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

    // Admin sees all locations
    if (isAdmin) {
      const locations = await prisma.location.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({ locations, isAdmin: true });
    }

    // Regular users see only locations they're assigned to
    const studentLocations = await prisma.studentLocation.findMany({
      where: {
        student: {
          parent: {
            user: {
              email: userEmail,
            },
          },
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Deduplicate locations (a parent might have multiple students in same location)
    const uniqueLocations = Array.from(
      new Map(studentLocations.map((sl) => [sl.location.id, sl.location])).values()
    );

    return NextResponse.json({ locations: uniqueLocations, isAdmin: false });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
