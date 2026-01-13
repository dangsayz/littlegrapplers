import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, constructWebhookEvent } from '@/lib/stripe';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
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
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const parentId = session.metadata?.parent_id;
  const clerkUserId = session.metadata?.clerk_user_id;
  const invoiceId = session.metadata?.invoice_id;
  const planType = session.metadata?.plan_type;
  const amount = (session.amount_total || 0) / 100;

  // Handle subscription checkout (new enrollment flow)
  if (clerkUserId && planType) {
    // For one-time payments (3-month), create a subscription record
    if (session.mode === 'payment') {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          stripe_subscription_id: `one_time_${session.id}`,
          clerk_user_id: clerkUserId,
          status: 'active',
          plan_name: '3-Month Paid-In-Full',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: true,
        });

      if (error) {
        console.error('Failed to create one-time subscription record:', error);
      } else {
        console.log(`One-time payment recorded for user ${clerkUserId}`);
      }
    }
    // Subscription mode payments are handled by customer.subscription.created event
    return;
  }

  // Legacy flow for parent payments
  if (!parentId) {
    console.error('No parent_id or clerk_user_id in session metadata');
    return;
  }

  // Update payment record
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_payment_intent_id: session.payment_intent as string,
      payment_method: 'card',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_checkout_session_id', session.id);

  if (updateError) {
    console.error('Failed to update payment:', updateError);
  }

  // Record transaction in history
  const { data: balance } = await supabase
    .from('parent_balances')
    .select('current_balance')
    .eq('parent_id', parentId)
    .single();

  const balanceAfter = (balance?.current_balance || 0) - amount;

  await supabase.from('balance_transactions').insert({
    parent_id: parentId,
    type: 'payment',
    amount: -amount,
    balance_after: balanceAfter,
    description: `Payment received - ${session.id}`,
    reference_id: invoiceId || null,
    reference_type: invoiceId ? 'invoice' : null,
  });

  console.log(`Payment succeeded for parent ${parentId}: $${amount}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      payment_method: paymentIntent.payment_method_types?.[0] || 'card',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Failed to update payment on intent success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.error('Failed to update payment on failure:', error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  
  // Find the original payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!payment) {
    console.error('Original payment not found for refund');
    return;
  }

  const refundAmount = (charge.amount_refunded || 0) / 100;

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  // Record refund transaction
  const { data: balance } = await supabase
    .from('parent_balances')
    .select('current_balance')
    .eq('parent_id', payment.parent_id)
    .single();

  const balanceAfter = (balance?.current_balance || 0) + refundAmount;

  await supabase.from('balance_transactions').insert({
    parent_id: payment.parent_id,
    type: 'refund',
    amount: refundAmount,
    balance_after: balanceAfter,
    description: `Refund processed - ${charge.id}`,
    reference_id: payment.id,
    reference_type: 'payment',
  });

  // Update parent balance
  await supabase
    .from('parent_balances')
    .update({
      current_balance: balanceAfter,
    })
    .eq('parent_id', payment.parent_id);

  console.log(`Refund processed for parent ${payment.parent_id}: $${refundAmount}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const clerkUserId = subscription.metadata?.clerk_user_id;
  const planType = subscription.metadata?.plan_type || 'monthly';
  
  if (!clerkUserId) {
    console.error('No clerk_user_id in subscription metadata');
    return;
  }

  const status = subscription.status;
  // Access subscription period from items if available
  const subData = subscription as unknown as { current_period_start?: number; current_period_end?: number };
  const currentPeriodStart = subData.current_period_start 
    ? new Date(subData.current_period_start * 1000).toISOString() 
    : new Date().toISOString();
  const currentPeriodEnd = subData.current_period_end 
    ? new Date(subData.current_period_end * 1000).toISOString() 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Upsert subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      clerk_user_id: clerkUserId,
      status: status,
      plan_name: planType === 'monthly' ? 'Monthly Agreement' : '3-Month Paid-In-Full',
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('Failed to upsert subscription:', error);
  } else {
    console.log(`Subscription ${status} for user ${clerkUserId}`);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to update cancelled subscription:', error);
  } else {
    console.log(`Subscription cancelled: ${subscription.id}`);
  }
}
