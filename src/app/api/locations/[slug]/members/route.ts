import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch members for a location
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
      .select('id, name')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (locError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Get members for this location
    const { data: members, error: membersError } = await supabaseAdmin
      .from('location_members')
      .select('id, user_id, role, joined_at')
      .eq('location_id', location.id);

    if (membersError) throw membersError;

    // Get user details for members
    const userIds = (members || []).map(m => m.user_id);
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', userIds.length > 0 ? userIds : ['none']);

    const userMap = new Map((users || []).map(u => [u.id, u]));

    const formattedMembers = (members || []).map(m => {
      const memberUser = userMap.get(m.user_id);
      const firstName = memberUser?.first_name || 'Unknown';
      const lastName = memberUser?.last_name || '';
      const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '??';
      
      return {
        id: m.id,
        name: `${firstName} ${lastName[0] ? lastName[0] + '.' : ''}`.trim(),
        fullName: `${firstName} ${lastName}`.trim(),
        email: memberUser?.email,
        role: m.role,
        initials,
        joinedAt: m.joined_at,
      };
    });

    return NextResponse.json({ 
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
