import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  waiverFormSchema,
  validateData,
  isRateLimited,
  getClientIdentifier,
  checkHoneypot,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'waiver');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Check for bot/spam via honeypot
    if (checkHoneypot(body)) {
      return NextResponse.json({ success: true, message: 'Waiver received' });
    }

    // Validate and sanitize all input
    const validation = validateData(waiverFormSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get IP address and user agent for legal records
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate a unique anonymous clerk_user_id for public submissions
    const anonymousClerkId = `anon_${crypto.randomUUID()}`;

    // Insert into Supabase (data is already sanitized)
    const { data: result, error } = await supabaseAdmin
      .from('signed_waivers')
      .insert({
        clerk_user_id: anonymousClerkId,
        guardian_full_name: data.guardianFullName,
        guardian_email: data.guardianEmail,
        guardian_phone: data.guardianPhone || null,
        child_full_name: data.childFullName,
        child_date_of_birth: data.childDateOfBirth || null,
        emergency_contact_name: data.emergencyContactName || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        digital_signature: data.digitalSignature,
        photo_media_consent: data.photoMediaConsent,
        agreed_to_terms: data.agreedToTerms,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2));
      console.error('Supabase error code:', error.code);
      console.error('Supabase error message:', error.message);
      console.error('Supabase error details:', error.details);
      return NextResponse.json(
        { error: `Failed to save waiver: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Waiver submitted successfully',
      waiverId: result.id,
    });
  } catch (error) {
    console.error('Waiver submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
