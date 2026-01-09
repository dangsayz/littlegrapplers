import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

// GET: Fetch current student of the month for a location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get location
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Get current month's student of the month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStr = currentMonth.toISOString().split('T')[0];

    const { data: sotm } = await supabaseAdmin
      .from('student_of_month')
      .select('id, student_name, enrollment_id, notes, selected_at')
      .eq('location_id', location.id)
      .eq('month', monthStr)
      .single();

    return NextResponse.json({ 
      studentOfMonth: sotm || null,
      month: monthStr,
    });
  } catch (error) {
    console.error('Error fetching student of month:', error);
    return NextResponse.json({ error: 'Failed to fetch student of month' }, { status: 500 });
  }
}

// POST: Set student of the month (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { slug } = await params;
    const { enrollmentId, studentName, notes } = await request.json();

    if (!studentName) {
      return NextResponse.json({ error: 'Student name is required' }, { status: 400 });
    }

    // Get location
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Get admin user ID
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStr = currentMonth.toISOString().split('T')[0];

    // Upsert student of the month
    const { data: sotm, error } = await supabaseAdmin
      .from('student_of_month')
      .upsert({
        location_id: location.id,
        enrollment_id: enrollmentId || null,
        student_name: studentName,
        month: monthStr,
        selected_by: adminUser?.id || null,
        selected_at: new Date().toISOString(),
        notes: notes || null,
      }, {
        onConflict: 'location_id,month',
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting student of month:', error);
      return NextResponse.json({ error: 'Failed to set student of month' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      studentOfMonth: sotm,
    });
  } catch (error) {
    console.error('Error setting student of month:', error);
    return NextResponse.json({ error: 'Failed to set student of month' }, { status: 500 });
  }
}

// DELETE: Remove student of the month (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { slug } = await params;

    // Get location
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq(isUUID ? 'id' : 'slug', slug)
      .single();

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStr = currentMonth.toISOString().split('T')[0];

    await supabaseAdmin
      .from('student_of_month')
      .delete()
      .eq('location_id', location.id)
      .eq('month', monthStr);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing student of month:', error);
    return NextResponse.json({ error: 'Failed to remove student of month' }, { status: 500 });
  }
}
