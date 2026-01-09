import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const user = await currentUser();
    
    // Check if user is admin
    if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pin } = await request.json();
    const { locationId } = await params;

    // Validate PIN (4-6 digits)
    if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
      return NextResponse.json(
        { error: 'PIN must be 4-6 digits' },
        { status: 400 }
      );
    }

    // Update location PIN
    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .update({ access_pin: pin || null })
      .eq('id', locationId)
      .select('id, name, access_pin')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
      throw error;
    }

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `PIN updated for ${location.name}`,
      location,
    });
  } catch (error) {
    console.error('Error updating location PIN:', error);
    return NextResponse.json(
      { error: 'Failed to update PIN' },
      { status: 500 }
    );
  }
}
