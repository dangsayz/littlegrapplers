import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('check_payment_status');

    if (error) {
      console.error('Failed to check payment status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Payment status check result:', data);

    return NextResponse.json({
      success: true,
      result: data,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron check-payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
