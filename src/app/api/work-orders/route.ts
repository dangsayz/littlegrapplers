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

// GET: List all work orders
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: workOrders, error } = await supabaseAdmin
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ workOrders: workOrders || [] });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 });
  }
}

// POST: Create a new work order request
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, priority, category, quoted_cost, status } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate enums
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    const validCategories = ['feature', 'bugfix', 'enhancement', 'maintenance'];
    const validStatuses = ['requested', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'];
    
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    
    // Only developers can set cost and status directly
    const isDev = isDeveloper(userEmail);
    const finalStatus = isDev && status && validStatuses.includes(status) ? status : 'requested';
    const finalCost = isDev && quoted_cost ? quoted_cost : null;

    const { data: workOrder, error } = await supabaseAdmin
      .from('work_orders')
      .insert({
        title: title.trim(),
        description: (description || title).trim(),
        priority: priority || 'normal',
        category: category || 'feature',
        requested_by: userEmail,
        status: finalStatus,
        quoted_cost: finalCost,
        ...(finalStatus === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ workOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}
