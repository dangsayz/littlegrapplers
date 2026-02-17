import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle relevant events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const enrollmentId = session.metadata?.enrollment_id;

    if (enrollmentId) {
      try {
        // Update enrollment to active
        const { error: updateError } = await supabaseAdmin
          .from('enrollments')
          .update({
            status: 'active',
            stripe_checkout_session_id: session.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollmentId);

        if (updateError) {
          console.error('Failed to activate enrollment:', updateError);
          
          // Log webhook failure for retry
          await supabaseAdmin
            .from('webhook_events')
            .insert({
              event_type: 'checkout.session.completed',
              event_data: session,
              processing_status: 'failed',
              error_message: updateError.message,
              created_at: new Date().toISOString(),
            });
        } else {
          // Log successful activation
          await supabaseAdmin
            .from('webhook_events')
            .insert({
              event_type: 'checkout.session.completed',
              event_data: session,
              processing_status: 'success',
              enrollment_id: enrollmentId,
              created_at: new Date().toISOString(),
            });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
