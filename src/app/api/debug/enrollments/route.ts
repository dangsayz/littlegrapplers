import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        child_first_name,
        child_last_name,
        guardian_email,
        status,
        submitted_at,
        stripe_checkout_session_id,
        plan_type,
        location_id,
        locations(name)
      `)
      .or('child_first_name.ilike.%bobbie%,child_first_name.ilike.%gracie%,guardian_email.ilike.%bobbie%')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Debug query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      enrollments: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
