import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendAdminNotification, createWaiverSignedEmail } from '@/lib/email';

interface WaiverSubmission {
  clerkUserId: string;
  guardianFullName: string;
  guardianEmail: string;
  guardianPhone?: string;
  childFullName: string;
  childDateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  locationId?: string;
  digitalSignature: string;
  photoMediaConsent: boolean;
  agreedToTerms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: WaiverSubmission = await request.json();

    // Validate that the clerk user ID matches
    if (body.clerkUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.guardianFullName || !body.guardianEmail || !body.childFullName || !body.digitalSignature || !body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user_id from users table
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    // Check if user already has a waiver
    const { data: existingWaiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingWaiver) {
      return NextResponse.json(
        { error: 'You have already signed a waiver' },
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
        user_id: dbUser?.id || null,
        clerk_user_id: userId,
        guardian_full_name: body.guardianFullName,
        guardian_email: body.guardianEmail,
        guardian_phone: body.guardianPhone || null,
        child_full_name: body.childFullName,
        child_date_of_birth: body.childDateOfBirth || null,
        emergency_contact_name: body.emergencyContactName || null,
        emergency_contact_phone: body.emergencyContactPhone || null,
        location_id: body.locationId || null,
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

    // Send admin notification email
    const emailNotification = createWaiverSignedEmail({
      guardianName: body.guardianFullName,
      guardianEmail: body.guardianEmail,
      guardianPhone: body.guardianPhone,
      childName: body.childFullName,
      childDob: body.childDateOfBirth,
      signedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    });
    await sendAdminNotification(emailNotification);

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

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('clerk_user_id', userId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      hasSigned: !!waiver,
      waiver: waiver || null,
    });
  } catch (error) {
    console.error('Waiver check error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
