import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  newsletterSchema,
  validateData,
  isRateLimited,
  getClientIdentifier,
  checkHoneypot,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'newsletter');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Check for bot/spam via honeypot
    if (checkHoneypot(body)) {
      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    // Validate and sanitize input
    const validation = validateData(newsletterSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, source = 'footer' } = validation.data;

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      // If they unsubscribed before, reactivate
      if (existing.status === 'unsubscribed') {
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            unsubscribed_at: null,
            first_name: firstName || null,
            last_name: lastName || null,
          })
          .eq('id', existing.id);

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter.',
      });
    }

    // Insert new subscriber (email is already sanitized)
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        source: source || 'footer',
        status: 'active',
      });

    if (error) {
      console.error('Newsletter subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! You\'ll receive updates about our programs.',
    });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
