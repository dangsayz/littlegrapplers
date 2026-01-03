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

// GET all parent balances (admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('parent_balances')
      .select(`
        *,
        parent:parents(id, first_name, last_name, email)
      `)
      .order('current_balance', { ascending: false });

    if (error) {
      console.error('Failed to fetch balances:', error);
      return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Balances GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add charge to parent balance
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parent_id, amount, description, create_invoice = true } = body;

    if (!parent_id || !amount || !description) {
      return NextResponse.json(
        { error: 'parent_id, amount, and description are required' },
        { status: 400 }
      );
    }

    // Get current balance
    const { data: balance } = await supabase
      .from('parent_balances')
      .select('current_balance, total_charged')
      .eq('parent_id', parent_id)
      .single();

    const currentBalance = balance?.current_balance || 0;
    const totalCharged = balance?.total_charged || 0;
    const newBalance = currentBalance + amount;

    // Create invoice if requested
    let invoiceId = null;
    if (create_invoice) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          parent_id,
          status: 'pending',
          amount_due: amount,
        })
        .select()
        .single();

      if (!invoiceError && invoice) {
        invoiceId = invoice.id;

        // Add invoice item
        await supabase.from('invoice_items').insert({
          invoice_id: invoice.id,
          description,
          amount,
          item_type: 'charge',
        });
      }
    }

    // Update or create parent balance
    await supabase
      .from('parent_balances')
      .upsert({
        parent_id,
        current_balance: newBalance,
        total_charged: totalCharged + amount,
      }, { onConflict: 'parent_id' });

    // Record transaction
    await supabase.from('balance_transactions').insert({
      parent_id,
      type: 'charge',
      amount,
      balance_after: newBalance,
      description,
      reference_id: invoiceId,
      reference_type: invoiceId ? 'invoice' : null,
      created_by: userId,
    });

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      invoice_id: invoiceId,
    });
  } catch (error) {
    console.error('Add charge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
