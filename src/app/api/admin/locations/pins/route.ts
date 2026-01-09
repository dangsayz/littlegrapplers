import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('slug, access_pin')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching location PINs:', error);
      return NextResponse.json({ error: 'Failed to fetch PINs' }, { status: 500 });
    }

    const pins: Record<string, string> = {};
    for (const loc of locations || []) {
      if (loc.access_pin) {
        pins[loc.slug] = loc.access_pin;
      }
    }

    return NextResponse.json({ pins });
  } catch (error) {
    console.error('Error in admin pins route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
