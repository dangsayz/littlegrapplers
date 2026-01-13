import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe, getStripeCustomerId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, planType } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get user info from signed_waivers (most recent)
    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('guardian_email, guardian_full_name, child_full_name, location_id')
      .eq('clerk_user_id', userId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    if (!waiver) {
      return NextResponse.json(
        { error: 'Please complete the waiver form first' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    const customerId = await getStripeCustomerId(
      waiver.guardian_email,
      waiver.guardian_full_name
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Determine if this is a subscription or one-time payment
    const isSubscription = planType === 'monthly';

    const sessionConfig: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${baseUrl}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/checkout?cancelled=true`,
      metadata: {
        clerk_user_id: userId,
        plan_type: planType,
        child_name: waiver.child_full_name,
        location_id: waiver.location_id || '',
      },
      subscription_data: isSubscription
        ? {
            metadata: {
              clerk_user_id: userId,
              plan_type: planType,
            },
          }
        : undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
