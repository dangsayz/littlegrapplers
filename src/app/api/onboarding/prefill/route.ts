import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/onboarding/prefill - Fetch existing waiver/user data to pre-populate onboarding form
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing signed waiver
    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('*')
      .eq('clerk_user_id', userId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    // Check for existing user record
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, phone')
      .eq('clerk_user_id', userId)
      .single();

    // Check for existing parent profile
    let parent = null;
    if (dbUser) {
      const { data: parentData } = await supabaseAdmin
        .from('parents')
        .select('*')
        .eq('user_id', dbUser.id)
        .single();
      parent = parentData;
    }

    // Build prefill data from available sources
    const prefillData: Record<string, string | boolean> = {};

    // From waiver
    if (waiver) {
      // Parse guardian name
      const guardianParts = (waiver.guardian_full_name || '').trim().split(' ');
      if (guardianParts.length >= 1) {
        prefillData.firstName = guardianParts[0];
      }
      if (guardianParts.length >= 2) {
        prefillData.lastName = guardianParts.slice(1).join(' ');
      }

      // Guardian contact info
      if (waiver.guardian_phone) {
        prefillData.phone = waiver.guardian_phone;
      }

      // Emergency contact
      if (waiver.emergency_contact_name) {
        prefillData.emergencyContactName = waiver.emergency_contact_name;
      }
      if (waiver.emergency_contact_phone) {
        prefillData.emergencyContactPhone = waiver.emergency_contact_phone;
      }

      // Parse child name
      const childParts = (waiver.child_full_name || '').trim().split(' ');
      if (childParts.length >= 1) {
        prefillData.studentFirstName = childParts[0];
      }
      if (childParts.length >= 2) {
        prefillData.studentLastName = childParts.slice(1).join(' ');
      }

      // Child DOB
      if (waiver.child_date_of_birth) {
        prefillData.studentDob = waiver.child_date_of_birth;
      }

      // Location
      if (waiver.location_id) {
        prefillData.locationId = waiver.location_id;
      }

      // Photo consent
      if (typeof waiver.photo_media_consent === 'boolean') {
        prefillData.photoConsent = waiver.photo_media_consent;
      }
    }

    // Override with user/parent data if available (more recent)
    if (dbUser) {
      if (dbUser.first_name) prefillData.firstName = dbUser.first_name;
      if (dbUser.last_name) prefillData.lastName = dbUser.last_name;
      if (dbUser.phone) prefillData.phone = dbUser.phone;
    }

    if (parent) {
      if (parent.first_name) prefillData.firstName = parent.first_name;
      if (parent.last_name) prefillData.lastName = parent.last_name;
      if (parent.phone) prefillData.phone = parent.phone;
      if (parent.emergency_contact_name) prefillData.emergencyContactName = parent.emergency_contact_name;
      if (parent.emergency_contact_phone) prefillData.emergencyContactPhone = parent.emergency_contact_phone;
      if (parent.how_heard) prefillData.howHeard = parent.how_heard;
      if (typeof parent.photo_consent === 'boolean') prefillData.photoConsent = parent.photo_consent;
    }

    return NextResponse.json({
      prefill: prefillData,
      hasWaiver: !!waiver,
      hasUser: !!dbUser,
      hasParent: !!parent,
    });
  } catch (error) {
    console.error('Prefill fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch prefill data' }, { status: 500 });
  }
}
