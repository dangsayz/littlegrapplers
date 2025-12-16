import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, PLANS, type PlanId } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, userEmail, waiverId } = body as {
      planId: PlanId;
      userEmail: string;
      waiverId: string;
    };

    // Validate plan
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('clerk_user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          clerk_user_id: userId,
          waiver_id: waiverId,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: plan.interval === 'month' ? 'subscription' : 'payment',
      success_url: `${baseUrl}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/checkout`,
      metadata: {
        clerk_user_id: userId,
        plan_id: planId,
        waiver_id: waiverId,
      },
    };

    // Add subscription-specific metadata
    if (plan.interval === 'month') {
      sessionParams.subscription_data = {
        metadata: {
          clerk_user_id: userId,
          plan_id: planId,
          waiver_id: waiverId,
        },
      };
    } else {
      // For one-time payments, add payment intent metadata
      sessionParams.payment_intent_data = {
        metadata: {
          clerk_user_id: userId,
          plan_id: planId,
          waiver_id: waiverId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create pending subscription record
    await supabaseAdmin.from('subscriptions').insert({
      clerk_user_id: userId,
      stripe_customer_id: stripeCustomerId,
      plan_id: planId,
      plan_name: plan.name,
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
