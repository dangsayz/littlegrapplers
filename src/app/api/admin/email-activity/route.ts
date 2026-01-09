import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS, DEVELOPER_EMAILS } from '@/lib/constants';

function isAuthorized(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email) || DEVELOPER_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Define types for the data
    interface EmailEvent {
      id: string;
      email_provider_id: string;
      recipient_email: string;
      event_type: string;
      event_timestamp: string;
      user_agent?: string;
      ip_address?: string;
      link_url?: string;
      bounce_type?: string;
      bounce_message?: string;
    }

    interface ReminderLog {
      id: string;
      recipient_email: string;
      amount_due: number;
      reminder_type: string;
      sent_at: string;
      email_provider_id?: string;
      status: string;
      opened_at?: string;
      clicked_at?: string;
      delivered_at?: string;
      open_count?: number;
      click_count?: number;
    }

    // Get email events (table may not exist yet)
    let events: EmailEvent[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('email_events')
        .select('*')
        .eq('recipient_email', email)
        .order('event_timestamp', { ascending: false })
        .limit(limit);
      
      if (!error && data) {
        events = data as EmailEvent[];
      }
    } catch (e) {
      console.log('email_events table may not exist yet');
    }

    // Get balance reminder logs for this email (table may not exist yet)
    let reminders: ReminderLog[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('balance_reminder_logs')
        .select('*')
        .eq('recipient_email', email)
        .order('sent_at', { ascending: false })
        .limit(limit);
      
      if (!error && data) {
        reminders = data as ReminderLog[];
      }
    } catch (e) {
      console.log('balance_reminder_logs table may not exist yet');
    }

    // Calculate engagement summary
    const totalSent = (events.filter(e => e.event_type === 'sent').length) + (reminders.length);
    const totalDelivered = events.filter(e => e.event_type === 'delivered').length;
    const totalOpened = events.filter(e => e.event_type === 'opened').length;
    const totalClicked = events.filter(e => e.event_type === 'clicked').length;
    const totalBounced = events.filter(e => e.event_type === 'bounced').length;

    // Get first/last email timestamps
    const allTimestamps = [
      ...events.map(e => new Date(e.event_timestamp).getTime()),
      ...reminders.map(r => new Date(r.sent_at).getTime()),
    ].filter(Boolean);

    const firstEmailAt = allTimestamps.length > 0 
      ? new Date(Math.min(...allTimestamps)).toISOString() 
      : null;
    const lastEmailAt = allTimestamps.length > 0 
      ? new Date(Math.max(...allTimestamps)).toISOString() 
      : null;

    // Find last opened timestamp
    const openEvents = events?.filter(e => e.event_type === 'opened') || [];
    const lastOpenedAt = openEvents.length > 0 
      ? openEvents[0].event_timestamp 
      : null;

    // Calculate open rate
    const openRate = totalDelivered > 0 
      ? Math.round((totalOpened / totalDelivered) * 100) 
      : (totalSent > 0 && totalOpened > 0 ? Math.round((totalOpened / totalSent) * 100) : 0);

    // Combine and sort all activity
    const activity = [
      ...(events || []).map(e => ({
        id: e.id,
        type: 'event' as const,
        event_type: e.event_type,
        timestamp: e.event_timestamp,
        email_provider_id: e.email_provider_id,
        user_agent: e.user_agent,
        ip_address: e.ip_address,
        link_url: e.link_url,
        bounce_type: e.bounce_type,
        bounce_message: e.bounce_message,
      })),
      ...(reminders || []).map(r => ({
        id: r.id,
        type: 'reminder' as const,
        event_type: 'reminder_sent',
        timestamp: r.sent_at,
        email_provider_id: r.email_provider_id,
        amount_due: r.amount_due,
        reminder_type: r.reminder_type,
        status: r.status,
        opened_at: r.opened_at,
        clicked_at: r.clicked_at,
        delivered_at: r.delivered_at,
        open_count: r.open_count,
        click_count: r.click_count,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      email,
      summary: {
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_bounced: totalBounced,
        first_email_at: firstEmailAt,
        last_email_at: lastEmailAt,
        last_opened_at: lastOpenedAt,
        open_rate: openRate,
      },
      activity,
      reminders: reminders || [],
      events: events || [],
    });
  } catch (error) {
    console.error('Error fetching email activity:', error);
    return NextResponse.json({ error: 'Failed to fetch email activity' }, { status: 500 });
  }
}
