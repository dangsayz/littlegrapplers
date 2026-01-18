/**
 * Payment Link API
 * Generates Stripe checkout links for existing students
 */

import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, planType = 'monthly' } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Fetch student details from signed_waivers
    const { data: student, error: studentError } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://littlegrapplers.net';

    // Get or create Stripe customer
    let customerId: string;
    const existingCustomers = await stripe.customers.list({
      email: student.parent_email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: student.parent_email,
        name: `${student.parent_first_name} ${student.parent_last_name}`,
        metadata: {
          student_id: studentId,
          child_name: student.child_full_name,
        },
      });
      customerId = newCustomer.id;
    }

    // Determine price based on plan type
    const isMonthly = planType === 'monthly';
    const priceId = isMonthly 
      ? process.env.STRIPE_PRICE_MONTHLY 
      : process.env.STRIPE_PRICE_3MONTH;

    if (!priceId) {
      return NextResponse.json({ error: 'Payment price not configured' }, { status: 500 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isMonthly ? 'subscription' : 'payment',
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
      metadata: {
        student_id: studentId,
        child_name: student.child_full_name,
        plan_type: planType,
        created_by: userEmail,
      },
      ...(isMonthly && {
        subscription_data: {
          metadata: {
            student_id: studentId,
            child_name: student.child_full_name,
            plan_type: planType,
          },
        },
      }),
    });

    return NextResponse.json({
      success: true,
      paymentUrl: session.url,
      studentName: student.child_full_name,
      parentEmail: student.parent_email,
      planType,
    });

  } catch (error) {
    console.error('Payment link error:', error);
    return NextResponse.json({ 
      error: (error as Error).message || 'Failed to generate payment link' 
    }, { status: 500 });
  }
}
