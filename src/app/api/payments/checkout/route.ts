import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, getStripeCustomerId, createCheckoutSession } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId, amount, description } = body;

    // Get parent info
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id, email, first_name, last_name')
      .eq('clerk_user_id', userId)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    const customerId = await getStripeCustomerId(
      parent.email,
      `${parent.first_name} ${parent.last_name}`
    );

    // Update parent_balances with Stripe customer ID if not set
    await supabase
      .from('parent_balances')
      .upsert({
        parent_id: parent.id,
        stripe_customer_id: customerId,
      }, { onConflict: 'parent_id' });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const session = await createCheckoutSession({
      customerId,
      lineItems: [{
        name: description || 'Payment',
        amount: amount,
      }],
      successUrl: `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/billing?cancelled=true`,
      metadata: {
        parent_id: parent.id,
        invoice_id: invoiceId || '',
      },
    });

    // Record pending payment
    await supabase.from('payments').insert({
      parent_id: parent.id,
      invoice_id: invoiceId || null,
      amount: amount,
      status: 'pending',
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
