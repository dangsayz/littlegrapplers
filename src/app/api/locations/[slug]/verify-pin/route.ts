import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { pin } = await request.json();
    const { slug } = await params;

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    // Find the location
    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .select('id, access_pin, name')
      .eq('slug', slug)
      .single();

    if (error || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if PIN matches
    if (location.access_pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Generate a visitor ID
    const cookieStore = await cookies();
    let visitorId = cookieStore.get('visitor_id')?.value;
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      cookieStore.set('visitor_id', visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Store PIN access (expires in 30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await supabaseAdmin
      .from('location_pin_access')
      .upsert({
        location_id: location.id,
        visitor_id: visitorId,
        expires_at: expiresAt,
      }, { onConflict: 'location_id,visitor_id' });

    // Set a cookie to remember PIN verification for this location
    cookieStore.set(`pin_verified_${slug}`, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'PIN verified successfully',
      locationName: location.name 
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('visitor_id')?.value;
    const pinVerifiedCookie = cookieStore.get(`pin_verified_${slug}`)?.value;

    if (!visitorId || !pinVerifiedCookie) {
      return NextResponse.json({ verified: false });
    }

    // Find the location
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!location) {
      return NextResponse.json({ verified: false });
    }

    // Check if there's valid PIN access
    const { data: access } = await supabaseAdmin
      .from('location_pin_access')
      .select('expires_at')
      .eq('location_id', location.id)
      .eq('visitor_id', visitorId)
      .single();

    if (!access || new Date(access.expires_at) < new Date()) {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Error checking PIN verification:', error);
    return NextResponse.json({ verified: false });
  }
}
