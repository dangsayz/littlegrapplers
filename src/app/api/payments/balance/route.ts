import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET parent's billing info
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Get balance
    const { data: balance } = await supabase
      .from('parent_balances')
      .select('*')
      .eq('parent_id', parent.id)
      .single();

    // Get pending invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq('parent_id', parent.id)
      .in('status', ['pending', 'partial', 'overdue'])
      .order('created_at', { ascending: false });

    // Get recent payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get transaction history
    const { data: transactions } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      balance: balance || {
        current_balance: 0,
        total_charged: 0,
        total_paid: 0,
      },
      invoices: invoices || [],
      payments: payments || [],
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Balance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
