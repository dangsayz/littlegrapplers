import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUserAdminRole, isSuperAdmin } from '@/lib/admin-roles';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;
    const { email } = await getCurrentUserAdminRole();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }

    console.log(`[Location Toggle] Attempting to set location ${locationId} to is_active=${is_active}`);
    
    const { data, error } = await supabaseAdmin
      .from('locations')
      .update({ is_active })
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      console.error('Failed to toggle location:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
    
    console.log(`[Location Toggle] Successfully updated location ${locationId}:`, data);

    await supabaseAdmin.from('activity_logs').insert({
      admin_email: email,
      action: `location.${is_active ? 'enabled' : 'disabled'}`,
      entity_type: 'location',
      entity_id: locationId,
      details: { location_name: data.name, is_active },
    });

    return NextResponse.json({ success: true, location: data });
  } catch (error) {
    console.error('Location toggle error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
