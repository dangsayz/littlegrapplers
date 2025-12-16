import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerk_user_id;
  const planId = session.metadata?.plan_id;

  if (!clerkUserId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // For one-time payments (3-month plan)
  if (session.mode === 'payment') {
    const now = new Date();
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        stripe_price_id: session.metadata?.price_id,
        current_period_start: now.toISOString(),
        current_period_end: threeMonthsLater.toISOString(),
      })
      .eq('clerk_user_id', clerkUserId)
      .eq('status', 'pending');
  }

  console.log(`Checkout completed for user ${clerkUserId}, plan ${planId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerk_user_id;

  if (!clerkUserId) {
    console.error('Missing clerk_user_id in subscription metadata');
    return;
  }

  const status = mapStripeStatus(subscription.status);
  
  // Get period dates from subscription
  const periodStart = (subscription as unknown as { current_period_start: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('clerk_user_id', clerkUserId);

  console.log(`Subscription updated for user ${clerkUserId}: ${status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerk_user_id;

  if (!clerkUserId) {
    console.error('Missing clerk_user_id in subscription metadata');
    return;
  }

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', clerkUserId)
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription canceled for user ${clerkUserId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update subscription status to active
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_customer_id', customerId)
    .eq('status', 'past_due');

  console.log(`Payment succeeded for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_customer_id', customerId);

  console.log(`Payment failed for customer ${customerId}`);
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'pending',
    incomplete_expired: 'expired',
    trialing: 'active',
    paused: 'canceled',
  };

  return statusMap[stripeStatus] || 'pending';
}
