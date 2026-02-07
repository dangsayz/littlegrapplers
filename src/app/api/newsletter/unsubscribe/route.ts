import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isRateLimited, getClientIdentifier } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent mass-unsubscribe attacks
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'newsletter');
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase().trim());

    if (error) {
      console.error('Newsletter unsubscribe error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from our newsletter.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
