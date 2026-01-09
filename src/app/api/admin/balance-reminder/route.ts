import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SUPER_ADMIN_EMAILS } from '@/lib/constants';

const DEV_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];
const CLIENT_EMAIL = 'info@littlegrapplers.net';

function isAuthorized(email: string | undefined): boolean {
  if (!email) return false;
  return DEV_EMAILS.includes(email) || SUPER_ADMIN_EMAILS.includes(email);
}

// GET: Get balance reminder settings
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: settings, error } = await supabaseAdmin
      .from('platform_status')
      .select(`
        balance_reminder_enabled,
        reminder_frequency,
        last_reminder_sent_at,
        next_reminder_scheduled_at,
        payment_expiration_date,
        client_email,
        client_name
      `)
      .single();

    if (error) throw error;

    // Get recent reminder logs
    const { data: recentLogs } = await supabaseAdmin
      .from('balance_reminder_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ 
      settings: settings || {
        balance_reminder_enabled: false,
        reminder_frequency: 'weekly',
        client_email: CLIENT_EMAIL,
        client_name: 'Little Grapplers',
      },
      recentLogs: recentLogs || [],
    });
  } catch (error) {
    console.error('Error fetching balance reminder settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH: Update balance reminder settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      balance_reminder_enabled,
      reminder_frequency,
      payment_expiration_date,
      client_email,
      client_name,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof balance_reminder_enabled === 'boolean') {
      updateData.balance_reminder_enabled = balance_reminder_enabled;
    }
    if (reminder_frequency && ['daily', 'weekly', 'biweekly', 'monthly'].includes(reminder_frequency)) {
      updateData.reminder_frequency = reminder_frequency;
    }
    if (payment_expiration_date !== undefined) {
      updateData.payment_expiration_date = payment_expiration_date || null;
    }
    if (client_email) {
      updateData.client_email = client_email;
    }
    if (client_name) {
      updateData.client_name = client_name;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('platform_status')
      .update(updateData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    console.error('Error updating balance reminder settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
