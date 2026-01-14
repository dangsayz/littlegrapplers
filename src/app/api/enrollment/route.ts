import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  isRateLimited,
  getClientIdentifier,
  checkHoneypot,
} from '@/lib/validation';
import { sendAdminNotification, createEnrollmentNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const enrollmentSchema = z.object({
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
  planType: z.enum(['month-to-month', '3-month-paid-in-full']).default('month-to-month'),
  digitalSignature: z.string().min(1).max(150),
  photoMediaConsent: z.boolean().default(false),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'enrollment');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Check for bot/spam via honeypot
    if (checkHoneypot(body)) {
      return NextResponse.json({ success: true, message: 'Enrollment received' });
    }

    // Validate input
    const validation = enrollmentSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const data = validation.data;

    // Get IP address for legal records
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    // Check if user is authenticated (optional)
    const user = await currentUser();
    const clerkUserId = user?.id || null;
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    // If authenticated, check if user already exists in our system
    let userId: string | null = null;
    if (clerkUserId) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();
      
      userId = existingUser?.id || null;
    }

    // Verify location exists
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('id', data.locationId)
      .eq('is_active', true)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ error: 'Invalid location selected' }, { status: 400 });
    }

    // Check for duplicate enrollment (same child + location + pending/approved/active)
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, status')
      .eq('guardian_email', data.guardianEmail)
      .eq('child_first_name', data.childFirstName)
      .eq('child_last_name', data.childLastName)
      .eq('location_id', data.locationId)
      .in('status', ['pending', 'approved', 'active'])
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: `An enrollment for ${data.childFirstName} at this location is already ${existingEnrollment.status}. Please contact us if you need assistance.` 
      }, { status: 400 });
    }

    // Create enrollment record
    const { data: enrollment, error: insertError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        location_id: data.locationId,
        status: 'pending',
        guardian_first_name: data.guardianFirstName,
        guardian_last_name: data.guardianLastName,
        guardian_email: data.guardianEmail,
        guardian_phone: data.guardianPhone || null,
        child_first_name: data.childFirstName,
        child_last_name: data.childLastName,
        child_date_of_birth: data.childDateOfBirth || null,
        emergency_contact_name: data.emergencyContactName || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        plan_type: data.planType,
        digital_signature: data.digitalSignature,
        photo_media_consent: data.photoMediaConsent,
        waiver_agreed_at: new Date().toISOString(),
        waiver_ip_address: ipAddress,
        clerk_user_id: clerkUserId,
        user_id: userId,
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Enrollment insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit enrollment' }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail || data.guardianEmail,
      action: 'enrollment.submitted',
      entity_type: 'enrollment',
      entity_id: enrollment.id,
      details: {
        child_name: `${data.childFirstName} ${data.childLastName}`,
        location_id: data.locationId,
        location_name: location.name,
        has_account: !!clerkUserId,
      },
    });

    // Send email notification to all admins
    const emailNotification = createEnrollmentNotificationEmail({
      childName: `${data.childFirstName} ${data.childLastName}`,
      guardianName: `${data.guardianFirstName} ${data.guardianLastName}`,
      guardianEmail: data.guardianEmail,
      guardianPhone: data.guardianPhone,
      locationName: location.name,
      planType: data.planType,
      submittedAt: new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    });
    
    // Fire and forget - don't block the response
    sendAdminNotification(emailNotification).catch(err => {
      console.error('Failed to send enrollment notification email:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment submitted successfully',
      enrollmentId: enrollment.id,
    });
  } catch (error) {
    console.error('Enrollment submission error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
