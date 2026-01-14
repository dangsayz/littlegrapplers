import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ locationId: null });
    }

    // Get user's active subscription with location
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('location_id')
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();

    return NextResponse.json({ 
      locationId: subscription?.location_id || null 
    });
  } catch {
    return NextResponse.json({ locationId: null });
  }
}
