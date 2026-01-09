import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!user || !email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch counts in parallel
    const [pendingEnrollmentsRes, unreadContactsRes] = await Promise.all([
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabaseAdmin
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
    ]);

    return NextResponse.json({
      pendingEnrollments: pendingEnrollmentsRes.count || 0,
      unreadContacts: unreadContactsRes.count || 0,
    });
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
