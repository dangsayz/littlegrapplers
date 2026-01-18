import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCommunityPinEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, email } = body;

    if (!enrollmentId && !email) {
      return NextResponse.json({ 
        error: 'Either enrollmentId or email is required' 
      }, { status: 400 });
    }

    // If enrollmentId is provided, get enrollment details
    if (enrollmentId) {
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .select(`
          id,
          guardian_email,
          guardian_first_name,
          guardian_last_name,
          child_first_name,
          child_last_name,
          location_id,
          status
        `)
        .eq('id', enrollmentId)
        .single();

      if (enrollmentError || !enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
      }

      if (!enrollment.location_id) {
        return NextResponse.json({ error: 'Enrollment has no location assigned' }, { status: 400 });
      }

      // Get location with PIN
      const { data: location, error: locationError } = await supabaseAdmin
        .from('locations')
        .select('id, name, slug, access_pin')
        .eq('id', enrollment.location_id)
        .single();

      if (locationError || !location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      if (!location.access_pin) {
        return NextResponse.json({ error: 'Location has no PIN configured' }, { status: 400 });
      }

      // Send PIN email
      const result = await sendCommunityPinEmail({
        parentEmail: enrollment.guardian_email,
        parentName: `${enrollment.guardian_first_name} ${enrollment.guardian_last_name}`,
        childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
        locationName: location.name,
        locationSlug: location.slug,
        pinCode: location.access_pin,
      });

      if (result.success) {
        // Log the action
        await supabaseAdmin.from('activity_logs').insert({
          admin_email: userEmail,
          action: 'pin.resent',
          entity_type: 'enrollment',
          entity_id: enrollmentId,
          details: {
            recipient_email: enrollment.guardian_email,
            location_name: location.name,
          },
        });

        return NextResponse.json({ 
          success: true, 
          message: `PIN sent to ${enrollment.guardian_email}` 
        });
      } else {
        return NextResponse.json({ 
          error: 'Failed to send PIN email',
          details: result 
        }, { status: 500 });
      }
    }

    // If email is provided, find all active enrollments for this email
    if (email) {
      const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
        .from('enrollments')
        .select(`
          id,
          guardian_email,
          guardian_first_name,
          guardian_last_name,
          child_first_name,
          child_last_name,
          location_id,
          status
        `)
        .eq('guardian_email', email)
        .eq('status', 'active');

      if (enrollmentsError || !enrollments || enrollments.length === 0) {
        return NextResponse.json({ error: 'No active enrollments found for this email' }, { status: 404 });
      }

      const results = [];
      for (const enrollment of enrollments) {
        if (!enrollment.location_id) continue;

        const { data: location } = await supabaseAdmin
          .from('locations')
          .select('id, name, slug, access_pin')
          .eq('id', enrollment.location_id)
          .single();

        if (!location?.access_pin) continue;

        const result = await sendCommunityPinEmail({
          parentEmail: enrollment.guardian_email,
          parentName: `${enrollment.guardian_first_name} ${enrollment.guardian_last_name}`,
          childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
          locationName: location.name,
          locationSlug: location.slug,
          pinCode: location.access_pin,
        });

        results.push({
          enrollmentId: enrollment.id,
          childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
          locationName: location.name,
          success: result.success,
        });
      }

      // Log the action
      await supabaseAdmin.from('activity_logs').insert({
        admin_email: userEmail,
        action: 'pin.bulk_resent',
        entity_type: 'email',
        entity_id: email,
        details: {
          recipient_email: email,
          count: results.filter(r => r.success).length,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: `PIN(s) sent to ${email}`,
        results 
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Resend PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to send PINs to all active members who might have missed them
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dryRun') === 'true';

    // Get all active enrollments with locations
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        guardian_email,
        guardian_first_name,
        guardian_last_name,
        child_first_name,
        child_last_name,
        location_id,
        status
      `)
      .eq('status', 'active')
      .not('location_id', 'is', null);

    if (error || !enrollments) {
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    // Get unique location IDs
    const locationIds = [...new Set(enrollments.map(e => e.location_id).filter(Boolean))];
    
    // Fetch all locations with PINs
    const { data: locations } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug, access_pin')
      .in('id', locationIds);

    const locationMap = new Map(locations?.map(l => [l.id, l]) || []);

    const results = [];
    const emailsSent = new Set();

    for (const enrollment of enrollments) {
      const location = locationMap.get(enrollment.location_id);
      if (!location?.access_pin) continue;

      // Avoid sending duplicate emails to same parent
      const emailKey = `${enrollment.guardian_email}-${enrollment.location_id}`;
      if (emailsSent.has(emailKey)) continue;
      emailsSent.add(emailKey);

      if (dryRun) {
        results.push({
          email: enrollment.guardian_email,
          childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
          locationName: location.name,
          wouldSend: true,
        });
      } else {
        const result = await sendCommunityPinEmail({
          parentEmail: enrollment.guardian_email,
          parentName: `${enrollment.guardian_first_name} ${enrollment.guardian_last_name}`,
          childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
          locationName: location.name,
          locationSlug: location.slug,
          pinCode: location.access_pin,
        });

        results.push({
          email: enrollment.guardian_email,
          childName: `${enrollment.child_first_name} ${enrollment.child_last_name}`,
          locationName: location.name,
          success: result.success,
        });
      }
    }

    if (!dryRun) {
      await supabaseAdmin.from('activity_logs').insert({
        admin_email: userEmail,
        action: 'pin.mass_resend',
        entity_type: 'system',
        entity_id: 'all_active',
        details: {
          total_sent: results.filter(r => r.success).length,
          total_attempted: results.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      dryRun,
      totalProcessed: results.length,
      results,
    });
  } catch (error) {
    console.error('Mass resend PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
