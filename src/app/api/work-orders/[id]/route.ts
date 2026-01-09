import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEV_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];
const CLIENT_EMAILS = ['info@littlegrapplers.net', 'walkawayy@icloud.com', 'littlegrapplersjitsu@gmail.com'];

function isAuthorized(email: string | undefined): boolean {
  if (!email) return false;
  return DEV_EMAILS.includes(email) || CLIENT_EMAILS.includes(email);
}

function isDeveloper(email: string | undefined): boolean {
  if (!email) return false;
  return DEV_EMAILS.includes(email);
}

// GET: Get single work order with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid work order ID' }, { status: 400 });
    }

    const { data: workOrder, error: workOrderError } = await supabaseAdmin
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (workOrderError || !workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('work_order_comments')
      .select('*')
      .eq('work_order_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    return NextResponse.json({ workOrder, comments: comments || [] });
  } catch (error) {
    console.error('Error fetching work order:', error);
    return NextResponse.json({ error: 'Failed to fetch work order' }, { status: 500 });
  }
}

// PATCH: Update work order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const isDev = isDeveloper(userEmail);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid work order ID' }, { status: 400 });
    }

    // Fetch existing work order
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Build update object based on role permissions
    const updateData: Record<string, unknown> = {};

    // Developers can update everything
    if (isDev) {
      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.description !== undefined) updateData.description = body.description.trim();
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.quoted_cost !== undefined) updateData.quoted_cost = body.quoted_cost;
      if (body.quoted_hours !== undefined) updateData.quoted_hours = body.quoted_hours;
      if (body.developer_notes !== undefined) updateData.developer_notes = body.developer_notes;
      if (body.status !== undefined) {
        updateData.status = body.status;
        if (body.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
        // When developer quotes, set status to quoted
        if (body.status === 'quoted') {
          updateData.assigned_to = userEmail;
        }
      }
      if (body.deliverables !== undefined) updateData.deliverables = body.deliverables;
      if (body.files_modified !== undefined) updateData.files_modified = body.files_modified;
      if (body.technical_summary !== undefined) updateData.technical_summary = body.technical_summary;
      if (body.paid !== undefined) {
        updateData.paid = body.paid;
        if (body.paid) {
          updateData.paid_at = new Date().toISOString();
        }
      }
    } else {
      // Clients can only:
      // 1. Update title/description if status is still 'requested'
      // 2. Approve a quoted order
      // 3. Cancel their own order
      
      if (existingOrder.status === 'requested') {
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.description !== undefined) updateData.description = body.description.trim();
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.category !== undefined) updateData.category = body.category;
      }
      
      // Client can approve a quoted order
      if (body.status === 'approved' && existingOrder.status === 'quoted') {
        updateData.status = 'approved';
      }
      
      // Client can cancel if not completed
      if (body.status === 'cancelled' && existingOrder.status !== 'completed') {
        updateData.status = 'cancelled';
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const { data: workOrder, error: updateError } = await supabaseAdmin
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ workOrder });
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
  }
}

// DELETE: Delete work order (developers only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isDeveloper(userEmail)) {
      return NextResponse.json({ error: 'Only developers can delete work orders' }, { status: 403 });
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid work order ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work order:', error);
    return NextResponse.json({ error: 'Failed to delete work order' }, { status: 500 });
  }
}
