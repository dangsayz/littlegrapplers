import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if it's a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug, address, city, state, description, hero_image_url, is_active')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (error || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    if (!location.is_active) {
      return NextResponse.json({ error: 'Location is not active' }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}
