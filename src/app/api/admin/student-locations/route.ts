import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/constants';
import { z } from 'zod';

// Validation schema for assigning a student to a location
const assignStudentSchema = z.object({
  studentId: z.string(),
  locationId: z.string(),
});

// GET: List all student-location assignments
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    const whereClause = locationId ? { locationId } : {};

    const assignments = await prisma.studentLocation.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            parent: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: { email: true },
                },
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// POST: Assign a student to a location
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = assignStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { studentId, locationId } = parsed.data;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Create the assignment (upsert to avoid duplicates)
    const assignment = await prisma.studentLocation.upsert({
      where: {
        studentId_locationId: {
          studentId,
          locationId,
        },
      },
      update: {
        assignedBy: userEmail!,
        assignedAt: new Date(),
      },
      create: {
        studentId,
        locationId,
        assignedBy: userEmail!,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Error assigning student:', error);
    return NextResponse.json({ error: 'Failed to assign student' }, { status: 500 });
  }
}

// DELETE: Remove a student from a location
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const locationId = searchParams.get('locationId');

    if (!studentId || !locationId) {
      return NextResponse.json({ error: 'studentId and locationId required' }, { status: 400 });
    }

    await prisma.studentLocation.delete({
      where: {
        studentId_locationId: {
          studentId,
          locationId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
  }
}
