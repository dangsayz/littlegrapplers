import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  onboardingFormSchema,
  validateData,
  isRateLimited,
  getClientIdentifier,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'onboarding');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate and sanitize all input
    const validation = validateData(onboardingFormSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      studentFirstName,
      studentLastName,
      studentDob,
      locationId,
      medicalConditions,
      tshirtSize,
      howHeard,
      photoConsent,
      waiverAccepted,
    } = validation.data;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const clerkUserId = user.id;

    // Create or update user in our users table
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    let userId: string;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          status: 'active',
        })
        .eq('clerk_user_id', clerkUserId)
        .select('id')
        .single();

      if (updateError) throw updateError;
      userId = updatedUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          phone,
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      userId = newUser.id;
    }

    // Create parent profile with emergency contact
    const { data: parentProfile, error: parentError } = await supabaseAdmin
      .from('parents')
      .upsert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        how_heard: howHeard,
        photo_consent: photoConsent,
        waiver_accepted: waiverAccepted,
        waiver_accepted_at: waiverAccepted ? new Date().toISOString() : null,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select('id')
      .single();

    if (parentError) throw parentError;

    // Create student record
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        parent_id: parentProfile.id,
        first_name: studentFirstName,
        last_name: studentLastName,
        date_of_birth: studentDob,
        medical_conditions: medicalConditions || null,
        tshirt_size: tshirtSize || null,
      })
      .select('id')
      .single();

    if (studentError) throw studentError;

    // Assign student to location
    await supabaseAdmin
      .from('student_locations')
      .insert({
        student_id: student.id,
        location_id: locationId,
      });

    // Also add user to user_locations for community access
    await supabaseAdmin
      .from('user_locations')
      .upsert({
        user_id: userId,
        location_id: locationId,
      }, {
        onConflict: 'user_id,location_id',
      });

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      admin_email: userEmail,
      action: 'user.onboarding_complete',
      entity_type: 'user',
      entity_id: userId,
      details: {
        student_name: `${studentFirstName} ${studentLastName}`,
        location_id: locationId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      userId,
      studentId: student.id,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}

// GET: Check if user has completed onboarding
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUserId = user.id;

    // Check if user exists and has completed onboarding
    const { data: parentProfile, error } = await supabaseAdmin
      .from('parents')
      .select('onboarding_completed')
      .eq('user_id', (
        await supabaseAdmin
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single()
      ).data?.id)
      .single();

    if (error || !parentProfile) {
      return NextResponse.json({ onboardingCompleted: false });
    }

    return NextResponse.json({ 
      onboardingCompleted: parentProfile.onboarding_completed || false 
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ onboardingCompleted: false });
  }
}
