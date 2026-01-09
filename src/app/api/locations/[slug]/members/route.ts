import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch members for a location
// IMPORTANT: enrollment.location_id is the SINGLE SOURCE OF TRUTH for student-location assignment.
// All member/student queries must use this field exclusively to ensure consistent scoping.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Get location by slug or ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const { data: location, error: locError } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (locError || !location) {
      console.error('Location not found for slug:', slug);
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // SINGLE SOURCE OF TRUTH: Query enrollments by location_id
    // Only include approved/active enrollments for this specific location
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, child_date_of_birth, submitted_at, clerk_user_id, status')
      .eq('location_id', location.id)
      .in('status', ['approved', 'active']);

    if (enrollError) {
      console.error('Error fetching enrollments:', enrollError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Format members from enrollments (single source of truth)
    const members = (enrollments || []).map(enrollment => {
      const firstName = enrollment.child_first_name || 'Unknown';
      const lastName = enrollment.child_last_name || '';
      const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';
      
      return {
        id: enrollment.id,
        name: `${firstName} ${lastName[0] ? lastName[0] + '.' : ''}`.trim(),
        fullName: `${firstName} ${lastName}`.trim(),
        email: null,
        role: 'student',
        type: 'student' as const,
        initials,
        joinedAt: enrollment.submitted_at,
        dateOfBirth: enrollment.child_date_of_birth || null,
      };
    });

    return NextResponse.json({ 
      members,
      total: members.length,
      studentCount: members.length,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
