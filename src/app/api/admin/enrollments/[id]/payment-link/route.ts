import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe, getStripeCustomerId } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { planType = 'monthly', sendEmail = false } = body;

    // Fetch enrollment
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*, locations(name)')
      .eq('id', id)
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Only allow payment links for pending/approved enrollments
    if (!['pending', 'approved'].includes(enrollment.status)) {
      return NextResponse.json({ 
        error: 'Payment links can only be generated for pending or approved enrollments' 
      }, { status: 400 });
    }

    const stripe = getStripe();
    const guardianFullName = `${enrollment.guardian_first_name} ${enrollment.guardian_last_name}`;
    const customerId = await getStripeCustomerId(enrollment.guardian_email, guardianFullName);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://littlegrapplers.net';
    const isSubscription = planType === 'monthly';
    const priceId = isSubscription 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY 
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_3MONTH;

    if (!priceId) {
      return NextResponse.json({ error: 'Payment configuration error - price not set' }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${baseUrl}/enroll/success?session_id={CHECKOUT_SESSION_ID}&enrollment_id=${enrollment.id}`,
      cancel_url: `${baseUrl}/enroll?cancelled=true`,
      metadata: {
        enrollment_id: enrollment.id,
        plan_type: planType,
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        location_id: enrollment.location_id,
        guardian_email: enrollment.guardian_email,
      },
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            enrollment_id: enrollment.id,
            plan_type: planType,
            location_id: enrollment.location_id,
          },
        },
      }),
    });

    // Update enrollment with checkout session ID
    await supabaseAdmin
      .from('enrollments')
      .update({ 
        stripe_checkout_session_id: session.id,
        status: 'approved', // Move to approved if pending
      })
      .eq('id', id);

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'enrollment.payment_link_generated',
      entity_type: 'enrollment',
      entity_id: id,
      details: {
        child_name: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        guardian_email: enrollment.guardian_email,
        plan_type: planType,
        checkout_session_id: session.id,
      },
    });

    // Optionally send email with payment link
    if (sendEmail && session.url) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@littlegrapplers.net';
        const fromName = process.env.RESEND_FROM_NAME || 'Little Grapplers';
        
        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: enrollment.guardian_email,
          subject: `Complete Your Enrollment for ${enrollment.child_first_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1F2A44;">Complete Your Enrollment</h2>
              <p>Hi ${enrollment.guardian_first_name},</p>
              <p>You're just one step away from completing ${enrollment.child_first_name}'s enrollment at Little Grapplers ${enrollment.locations?.name || ''}!</p>
              <p>Click the button below to complete your payment:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${session.url}" style="background-color: #2EC4B6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Complete Payment
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you have any questions, please reply to this email.</p>
              <p>Thank you,<br>The Little Grapplers Team</p>
            </div>
          `,
        });

        await supabaseAdmin.from('activity_logs').insert({
          admin_email: userEmail,
          action: 'enrollment.payment_link_emailed',
          entity_type: 'enrollment',
          entity_id: id,
          details: {
            guardian_email: enrollment.guardian_email,
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment link email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      emailSent: sendEmail,
    });
  } catch (error) {
    console.error('Error generating payment link:', error);
    return NextResponse.json({ error: 'Failed to generate payment link' }, { status: 500 });
  }
}
