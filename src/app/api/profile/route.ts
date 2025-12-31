import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/profile - Fetch current user's profile
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, phone')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get parent profile
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('id, first_name, last_name, phone, emergency_contact_name, emergency_contact_phone, how_heard, photo_consent')
      .eq('user_id', dbUser.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    // Get address
    const { data: address } = await supabaseAdmin
      .from('parent_addresses')
      .select('street_address, city, state, zip')
      .eq('parent_id', parent.id)
      .single();

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email || user.emailAddresses?.[0]?.emailAddress,
        firstName: parent.first_name || dbUser.first_name,
        lastName: parent.last_name || dbUser.last_name,
        phone: parent.phone || dbUser.phone,
        emergencyContactName: parent.emergency_contact_name,
        emergencyContactPhone: parent.emergency_contact_phone,
        photoConsent: parent.photo_consent,
        address: address ? {
          streetAddress: address.street_address,
          city: address.city,
          state: address.state,
          zip: address.zip,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, data } = body;

    // Validate section
    if (!['personal', 'address', 'emergency'].includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get parent profile
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('user_id', dbUser.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    // Update based on section
    if (section === 'personal') {
      // Validate personal data
      if (!data.firstName?.trim() || !data.lastName?.trim()) {
        return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
      }

      // Validate phone format if provided
      if (data.phone && !/^[\d\s\-\(\)\+]{10,20}$/.test(data.phone.replace(/\s/g, ''))) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin
        .from('parents')
        .update({
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone: data.phone?.trim() || null,
        })
        .eq('id', parent.id);

      if (updateError) throw updateError;

      // Also update users table
      await supabaseAdmin
        .from('users')
        .update({
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone: data.phone?.trim() || null,
        })
        .eq('id', dbUser.id);
    }

    if (section === 'address') {
      // Validate address data
      const addressData = {
        street_address: data.streetAddress?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim()?.toUpperCase() || null,
        zip: data.zip?.trim() || null,
      };

      // Validate state format (2 letters)
      if (addressData.state && !/^[A-Z]{2}$/.test(addressData.state)) {
        return NextResponse.json({ error: 'State must be 2 letter abbreviation' }, { status: 400 });
      }

      // Validate ZIP format
      if (addressData.zip && !/^\d{5}(-\d{4})?$/.test(addressData.zip)) {
        return NextResponse.json({ error: 'Invalid ZIP code format' }, { status: 400 });
      }

      // Upsert address
      const { error: upsertError } = await supabaseAdmin
        .from('parent_addresses')
        .upsert({
          parent_id: parent.id,
          ...addressData,
        }, {
          onConflict: 'parent_id',
        });

      if (upsertError) throw upsertError;
    }

    if (section === 'emergency') {
      // Validate emergency contact data
      if (data.emergencyContactName && !data.emergencyContactPhone) {
        return NextResponse.json({ error: 'Emergency contact phone is required when name is provided' }, { status: 400 });
      }

      if (data.emergencyContactPhone && !/^[\d\s\-\(\)\+]{10,20}$/.test(data.emergencyContactPhone.replace(/\s/g, ''))) {
        return NextResponse.json({ error: 'Invalid emergency contact phone format' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin
        .from('parents')
        .update({
          emergency_contact_name: data.emergencyContactName?.trim() || null,
          emergency_contact_phone: data.emergencyContactPhone?.trim() || null,
        })
        .eq('id', parent.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
