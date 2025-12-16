import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface WaiverSubmission {
  guardianFullName: string;
  guardianEmail: string;
  guardianPhone?: string;
  childFullName: string;
  childDateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  planType: 'month-to-month' | '3-month' | '6-month';
  digitalSignature: string;
  photoMediaConsent: boolean;
  agreedToTerms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: WaiverSubmission = await request.json();

    // Validate required fields
    if (!body.guardianFullName || !body.guardianEmail || !body.childFullName || !body.digitalSignature || !body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.guardianEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for legal records
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('signed_waivers')
      .insert({
        guardian_full_name: body.guardianFullName,
        guardian_email: body.guardianEmail,
        guardian_phone: body.guardianPhone || null,
        child_full_name: body.childFullName,
        child_date_of_birth: body.childDateOfBirth || null,
        emergency_contact_name: body.emergencyContactName || null,
        emergency_contact_phone: body.emergencyContactPhone || null,
        plan_type: body.planType,
        digital_signature: body.digitalSignature,
        photo_media_consent: body.photoMediaConsent,
        agreed_to_terms: body.agreedToTerms,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save waiver. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Waiver submitted successfully',
      waiverId: data.id,
    });
  } catch (error) {
    console.error('Waiver submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
