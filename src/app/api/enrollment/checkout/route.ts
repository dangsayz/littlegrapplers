import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe, getStripeCustomerId } from '@/lib/stripe';
import {
  isRateLimited,
  getClientIdentifier,
  checkHoneypot,
} from '@/lib/validation';
import { z } from 'zod';
import { runEnrollmentHealthCheck } from '@/lib/enrollment-monitor';

const enrollmentCheckoutSchema = z.object({
  locationId: z.string().uuid('Invalid location'),
  guardianFirstName: z.string().min(1).max(100),
  guardianLastName: z.string().min(1).max(100),
  guardianEmail: z.string().email().max(254),
  guardianPhone: z.string().max(20).optional(),
  childFirstName: z.string().min(1).max(100),
  childLastName: z.string().min(1).max(100),
  childDateOfBirth: z.string().optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  planType: z.enum(['monthly', '3month']),
  digitalSignature: z.string().min(1).max(150),
  photoMediaConsent: z.boolean().default(false),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'enrollment');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (checkHoneypot(body)) {
      return NextResponse.json({ success: true, message: 'Processing' });
    }

    const validation = enrollmentCheckoutSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const data = validation.data;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('id', data.locationId)
      .eq('is_active', true)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: 'Invalid location selected' }, { status: 400 });
    }

    // Check for existing enrollment — if already ACTIVE (paid), block duplicate.
    // If pending/approved (unpaid), REUSE that enrollment and send them to payment.
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, stripe_checkout_session_id')
      .eq('guardian_email', data.guardianEmail)
      .eq('child_first_name', data.childFirstName)
      .eq('child_last_name', data.childLastName)
      .eq('location_id', data.locationId)
      .in('status', ['pending', 'approved', 'active', 'pending_payment'])
      .single();

    if (existingEnrollment && existingEnrollment.status === 'active') {
      return NextResponse.json({ 
        error: `${data.childFirstName} is already enrolled at this location.` 
      }, { status: 400 });
    }

    let enrollmentId: string;

    if (existingEnrollment && ['pending', 'approved', 'pending_payment'].includes(existingEnrollment.status)) {
      // Reuse existing unpaid enrollment — update it with latest info and proceed to payment
      const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({
          status: 'pending_payment',
          guardian_first_name: data.guardianFirstName,
          guardian_last_name: data.guardianLastName,
          guardian_phone: data.guardianPhone || null,
          child_date_of_birth: data.childDateOfBirth || null,
          emergency_contact_name: data.emergencyContactName || null,
          emergency_contact_phone: data.emergencyContactPhone || null,
          plan_type: data.planType === 'monthly' ? 'month-to-month' : '3-month-paid-in-full',
          digital_signature: data.digitalSignature,
          photo_media_consent: data.photoMediaConsent,
          waiver_agreed_at: new Date().toISOString(),
          waiver_ip_address: ipAddress,
        })
        .eq('id', existingEnrollment.id);

      if (updateError) {
        console.error('Enrollment update error:', updateError);
        return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
      }

      enrollmentId = existingEnrollment.id;
      console.log(`Reusing existing enrollment ${enrollmentId} (was ${existingEnrollment.status}) for payment`);
    } else {
      // No existing enrollment — create new one
      const { data: enrollment, error: insertError } = await supabaseAdmin
        .from('enrollments')
        .insert({
          location_id: data.locationId,
          status: 'pending_payment',
          guardian_first_name: data.guardianFirstName,
          guardian_last_name: data.guardianLastName,
          guardian_email: data.guardianEmail,
          guardian_phone: data.guardianPhone || null,
          child_first_name: data.childFirstName,
          child_last_name: data.childLastName,
          child_date_of_birth: data.childDateOfBirth || null,
          emergency_contact_name: data.emergencyContactName || null,
          emergency_contact_phone: data.emergencyContactPhone || null,
          plan_type: data.planType === 'monthly' ? 'month-to-month' : '3-month-paid-in-full',
          digital_signature: data.digitalSignature,
          photo_media_consent: data.photoMediaConsent,
          waiver_agreed_at: new Date().toISOString(),
          waiver_ip_address: ipAddress,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Enrollment insert error:', insertError);
        return NextResponse.json({ error: 'Failed to submit enrollment' }, { status: 500 });
      }

      enrollmentId = enrollment.id;
    }

    const stripe = getStripe();
    const guardianFullName = `${data.guardianFirstName} ${data.guardianLastName}`;
    const customerId = await getStripeCustomerId(data.guardianEmail, guardianFullName);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isSubscription = data.planType === 'monthly';
    const priceId = isSubscription 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY 
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_3MONTH;

    if (!priceId) {
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${baseUrl}/enroll/success?session_id={CHECKOUT_SESSION_ID}&enrollment_id=${enrollmentId}`,
      cancel_url: `${baseUrl}/enroll?cancelled=true`,
      metadata: {
        enrollment_id: enrollmentId,
        plan_type: data.planType,
        child_name: `${data.childFirstName} ${data.childLastName}`,
        location_id: data.locationId,
        guardian_email: data.guardianEmail,
      },
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            enrollment_id: enrollmentId,
            plan_type: data.planType,
            location_id: data.locationId,
          },
        },
      }),
    });

    await supabaseAdmin
      .from('enrollments')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', enrollmentId);

    // Proactive health check - fix any existing issues
    try {
      await runEnrollmentHealthCheck();
    } catch (error) {
      console.error('Health check failed:', error);
      // Don't fail the enrollment if health check fails
    }

    return NextResponse.json({
      success: true,
      enrollmentId: enrollmentId,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Enrollment checkout error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
