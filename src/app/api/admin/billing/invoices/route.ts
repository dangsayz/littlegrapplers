import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com', 'info@littlegrapplers.net'];

async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('parents')
    .select('email')
    .eq('clerk_user_id', userId)
    .single();
  
  return data ? ADMIN_EMAILS.includes(data.email) : false;
}

// GET all invoices (admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const parentId = searchParams.get('parent_id');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        parent:parents(id, first_name, last_name, email),
        items:invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new invoice
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parent_id, items, due_date, notes, status = 'pending' } = body;

    if (!parent_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'parent_id and items are required' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const amount_due = items.reduce(
      (sum: number, item: { amount: number; quantity?: number }) =>
        sum + item.amount * (item.quantity || 1),
      0
    );

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        parent_id,
        status,
        amount_due,
        due_date: due_date || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    // Create invoice items
    const itemsToInsert = items.map((item: { description: string; amount: number; quantity?: number; student_id?: string; item_type?: string }) => ({
      invoice_id: invoice.id,
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
      student_id: item.student_id || null,
      item_type: item.item_type || 'charge',
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Failed to create invoice items:', itemsError);
    }

    // Record transaction in balance history
    const { data: balance } = await supabase
      .from('parent_balances')
      .select('current_balance')
      .eq('parent_id', parent_id)
      .single();

    const balanceAfter = (balance?.current_balance || 0) + amount_due;

    await supabase.from('balance_transactions').insert({
      parent_id,
      type: 'charge',
      amount: amount_due,
      balance_after: balanceAfter,
      description: `Invoice ${invoice.invoice_number} created`,
      reference_id: invoice.id,
      reference_type: 'invoice',
      created_by: userId,
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Invoice POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
