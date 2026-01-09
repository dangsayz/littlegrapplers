import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const DEV_STRIPE_SECRET = process.env.DEV_STRIPE_SECRET_KEY;
const MAINTENANCE_PRICE_ID = process.env.DEV_MAINTENANCE_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DEV_STRIPE_SECRET) {
      return NextResponse.json(
        { error: 'Developer payment not configured' },
        { status: 500 }
      );
    }

    const devStripe = new Stripe(DEV_STRIPE_SECRET);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If we have a price ID, use it; otherwise create inline price
    const lineItems = MAINTENANCE_PRICE_ID
      ? [{ price: MAINTENANCE_PRICE_ID, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Platform Maintenance',
                description: 'Monthly hosting & maintenance for Little Grapplers (Supabase, Vercel, domain)',
              },
              unit_amount: 3000, // $30.00
              recurring: {
                interval: 'month' as const,
              },
            },
            quantity: 1,
          },
        ];

    const session = await devStripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard/admin/developer?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/admin/developer?subscription=cancelled`,
      metadata: {
        type: 'maintenance_subscription',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create subscription', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Check subscription status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DEV_STRIPE_SECRET) {
      return NextResponse.json({ subscription: null });
    }

    const devStripe = new Stripe(DEV_STRIPE_SECRET);

    // Get all active subscriptions
    const subscriptions = await devStripe.subscriptions.list({
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for past_due subscriptions
      const pastDue = await devStripe.subscriptions.list({
        status: 'past_due',
        limit: 1,
      });

      if (pastDue.data.length > 0) {
        const sub = pastDue.data[0] as Stripe.Subscription & { current_period_end: number };
        return NextResponse.json({
          subscription: {
            id: sub.id,
            status: 'past_due',
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            amount: (sub.items.data[0]?.price?.unit_amount || 3000) / 100,
          },
        });
      }

      return NextResponse.json({ subscription: null });
    }

    const sub = subscriptions.data[0] as Stripe.Subscription & { current_period_end: number };
    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        amount: (sub.items.data[0]?.price?.unit_amount || 3000) / 100,
      },
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json({ subscription: null });
  }
}
