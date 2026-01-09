import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUserAdminRole, isSuperAdmin } from '@/lib/admin-roles';

export async function GET(request: Request) {
  try {
    const { email } = await getCurrentUserAdminRole();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data: logs, error } = await supabaseAdmin
      .from('platform_status_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch platform logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Platform logs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
