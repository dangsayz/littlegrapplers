import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

interface ActivityItem {
  id: string;
  type: 'payment' | 'refund' | 'enrollment' | 'signup' | 'subscription' | 'cancellation';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export async function GET() {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activities: ActivityItem[] = [];

    // Fetch recent Stripe events (payments, refunds, subscriptions)
    try {
      const stripe = getStripe();
      const events = await stripe.events.list({
        limit: 50,
        types: [
          'payment_intent.succeeded',
          'charge.refunded',
          'customer.subscription.created',
          'customer.subscription.deleted',
          'invoice.paid',
        ],
      });

      for (const event of events.data) {
        const eventData = event.data.object as unknown as Record<string, unknown>;
        
        if (event.type === 'payment_intent.succeeded') {
          const amount = (eventData.amount as number) / 100;
          const customerEmail = eventData.receipt_email as string || 'Customer';
          activities.push({
            id: event.id,
            type: 'payment',
            title: 'Payment Received',
            description: `${customerEmail} paid $${amount.toFixed(2)}`,
            amount,
            timestamp: new Date(event.created * 1000).toISOString(),
            metadata: { stripeEventId: event.id },
          });
        } else if (event.type === 'charge.refunded') {
          const amount = (eventData.amount_refunded as number) / 100;
          activities.push({
            id: event.id,
            type: 'refund',
            title: 'Refund Issued',
            description: `Refunded $${amount.toFixed(2)}`,
            amount,
            timestamp: new Date(event.created * 1000).toISOString(),
            metadata: { stripeEventId: event.id },
          });
        } else if (event.type === 'customer.subscription.created') {
          activities.push({
            id: event.id,
            type: 'subscription',
            title: 'New Subscription',
            description: 'A new subscription was started',
            timestamp: new Date(event.created * 1000).toISOString(),
            metadata: { stripeEventId: event.id },
          });
        } else if (event.type === 'customer.subscription.deleted') {
          activities.push({
            id: event.id,
            type: 'cancellation',
            title: 'Subscription Cancelled',
            description: 'A subscription was cancelled',
            timestamp: new Date(event.created * 1000).toISOString(),
            metadata: { stripeEventId: event.id },
          });
        } else if (event.type === 'invoice.paid') {
          const amount = (eventData.amount_paid as number) / 100;
          activities.push({
            id: event.id,
            type: 'payment',
            title: 'Invoice Paid',
            description: `Invoice for $${amount.toFixed(2)} was paid`,
            amount,
            timestamp: new Date(event.created * 1000).toISOString(),
            metadata: { stripeEventId: event.id },
          });
        }
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
    }

    // Fetch recent enrollments
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, created_at, student_first_name, student_last_name, guardian_name')
      .order('created_at', { ascending: false })
      .limit(20);

    if (enrollments) {
      for (const enrollment of enrollments) {
        const studentName = `${enrollment.student_first_name} ${enrollment.student_last_name}`;
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'enrollment',
          title: enrollment.status === 'active' ? 'Enrollment Activated' : 'New Enrollment',
          description: `${enrollment.guardian_name} enrolled ${studentName}`,
          timestamp: enrollment.created_at,
          metadata: { enrollmentId: enrollment.id, status: enrollment.status },
        });
      }
    }

    // Fetch recent signups (waivers)
    const { data: waivers } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, guardian_full_name, child_full_name, signed_at')
      .order('signed_at', { ascending: false })
      .limit(20);

    if (waivers) {
      for (const waiver of waivers) {
        activities.push({
          id: `waiver-${waiver.id}`,
          type: 'signup',
          title: 'Waiver Signed',
          description: `${waiver.guardian_full_name} signed waiver for ${waiver.child_full_name}`,
          timestamp: waiver.signed_at,
          metadata: { waiverId: waiver.id },
        });
      }
    }

    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 50 most recent
    const recentActivities = activities.slice(0, 50);

    return NextResponse.json({ activities: recentActivities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
