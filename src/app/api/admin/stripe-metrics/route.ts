/**
 * Stripe Metrics API
 * Fetches real revenue data from Stripe, excluding admin/test accounts
 */

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe';
import { ADMIN_EMAILS, EXCLUDED_FROM_METRICS_EMAILS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();

    // Get all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    });

    // Filter out admin/test emails
    const realSubscriptions = subscriptions.data.filter(sub => {
      const customer = sub.customer as { email?: string };
      const email = customer?.email || '';
      return !EXCLUDED_FROM_METRICS_EMAILS.includes(email.toLowerCase());
    });

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    let monthlyCount = 0;
    let threeMonthCount = 0;

    for (const sub of realSubscriptions) {
      const item = sub.items.data[0];
      if (item?.price) {
        const amount = item.price.unit_amount || 0;
        const interval = item.price.recurring?.interval;
        
        if (interval === 'month') {
          mrr += amount / 100; // Convert cents to dollars
          monthlyCount++;
        } else if (interval === 'year') {
          mrr += (amount / 100) / 12; // Convert annual to monthly
        }
      }
    }

    // Get one-time payments from last 30 days (3-month packages)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const payments = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    // Filter successful one-time payments, excluding admin emails
    const successfulPayments = payments.data.filter(p => p.status === 'succeeded');
    
    let oneTimeRevenue = 0;
    for (const payment of successfulPayments) {
      // Check if this is from an excluded email
      if (payment.customer) {
        try {
          const customer = await stripe.customers.retrieve(payment.customer as string);
          if ('email' in customer && customer.email) {
            if (EXCLUDED_FROM_METRICS_EMAILS.includes(customer.email.toLowerCase())) {
              continue;
            }
          }
        } catch {
          // Customer may have been deleted
        }
      }
      
      // Check if this is a one-time payment (metadata or description indicates 3-month plan)
      const metadata = payment.metadata || {};
      const isOneTime = metadata.plan_type === '3month' || !metadata.subscription_id;
      if (isOneTime) {
        oneTimeRevenue += payment.amount / 100;
        threeMonthCount++;
      }
    }

    // Calculate metrics
    const arr = mrr * 12;
    const projectedRevenue = mrr * 3; // 90-day projection

    // Get previous month's MRR for growth calculation
    const prevMonthStart = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
    const prevMonthEnd = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    const prevPayments = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: prevMonthStart, lte: prevMonthEnd },
    });
    
    const prevRevenue = prevPayments.data
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + (p.amount / 100), 0);
    
    const currentRevenue = mrr + oneTimeRevenue;
    const mrrGrowth = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;

    return NextResponse.json({
      isConnected: true,
      metrics: {
        mrr: Math.round(mrr + oneTimeRevenue),
        arr: Math.round(arr),
        projectedRevenue: Math.round(projectedRevenue),
        activeSubscriptions: realSubscriptions.length,
        mrrGrowth: Math.round(mrrGrowth * 10) / 10,
        churnRate: 0, // TODO: Calculate from cancelled subs
        monthlySubscribers: monthlyCount,
        threeMonthPurchases: threeMonthCount,
      },
    });

  } catch (error) {
    console.error('Stripe metrics error:', error);
    
    // Always return connected=true if Stripe keys exist - subscriptions page proves it works
    // Just return zero metrics if there's a fetch error
    return NextResponse.json({
      isConnected: true,
      error: (error as Error).message,
      metrics: {
        mrr: 0,
        arr: 0,
        projectedRevenue: 0,
        activeSubscriptions: 0,
        mrrGrowth: null,
        churnRate: null,
        monthlySubscribers: 0,
        threeMonthPurchases: 0,
      },
    });
  }
}
