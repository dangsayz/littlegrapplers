import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const user = await currentUser();
    
    // Check if user is admin
    if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
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
      throw error;
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
