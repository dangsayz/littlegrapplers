import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const DEV_STRIPE_SECRET = process.env.DEV_STRIPE_SECRET_KEY;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DEV_STRIPE_SECRET) {
      return NextResponse.json({ payments: [] });
    }

    const devStripe = new Stripe(DEV_STRIPE_SECRET);

    // Get successful payment intents
    const paymentIntents = await devStripe.paymentIntents.list({
      limit: 50,
    });

    // Get invoices (for subscriptions)
    const invoices = await devStripe.invoices.list({
      limit: 50,
    });

    // Combine and format payments
    const payments: Array<{
      id: string;
      type: 'one_time' | 'subscription';
      amount: number;
      status: string;
      description: string;
      date: string;
    }> = [];

    // Add one-time payments
    for (const pi of paymentIntents.data) {
      if (pi.status === 'succeeded' && pi.metadata?.type === 'developer_payment') {
        payments.push({
          id: pi.id,
          type: 'one_time',
          amount: pi.amount / 100,
          status: 'paid',
          description: pi.metadata?.description || 'Development services',
          date: new Date(pi.created * 1000).toISOString(),
        });
      }
    }

    // Add subscription payments
    for (const inv of invoices.data) {
      if (inv.status === 'paid' && inv.amount_paid > 0) {
        payments.push({
          id: inv.id,
          type: 'subscription',
          amount: inv.amount_paid / 100,
          status: 'paid',
          description: 'Platform Maintenance',
          date: new Date(inv.created * 1000).toISOString(),
        });
      }
    }

    // Sort by date descending
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate totals
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const subscriptionPayments = payments.filter(p => p.type === 'subscription');
    const oneTimePayments = payments.filter(p => p.type === 'one_time');

    return NextResponse.json({
      payments,
      totals: {
        all: totalPaid,
        subscription: subscriptionPayments.reduce((sum, p) => sum + p.amount, 0),
        oneTime: oneTimePayments.reduce((sum, p) => sum + p.amount, 0),
      },
    });
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json({ payments: [], totals: { all: 0, subscription: 0, oneTime: 0 } });
  }
}
