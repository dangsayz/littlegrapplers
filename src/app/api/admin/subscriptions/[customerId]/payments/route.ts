import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe';
import { ADMIN_EMAILS } from '@/lib/constants';

// GET: Fetch payment history for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await params;
    const stripe = getStripe();

    // Fetch invoices for this customer
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
      expand: ['data.charge'],
    });

    // Format invoices with payment details
    const payments = invoices.data.map(invoice => {
      // Access charge from expanded data
      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const charge = invoiceAny.charge as {
        id: string;
        amount_refunded?: number;
        refunded?: boolean;
        receipt_url?: string;
      } | null;

      return {
        id: invoice.id,
        number: invoice.number,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: (invoice.amount_paid || 0) / 100,
        status: invoice.status,
        description: invoice.lines.data[0]?.description || 'Subscription payment',
        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        receiptUrl: charge?.receipt_url || invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
        refunded: charge?.refunded || false,
        refundAmount: charge?.amount_refunded ? charge.amount_refunded / 100 : 0,
      };
    });

    // Calculate totals
    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalRefunded = payments
      .reduce((sum, p) => sum + p.refundAmount, 0);

    return NextResponse.json({ 
      payments,
      summary: {
        totalPaid,
        totalRefunded,
        netRevenue: totalPaid - totalRefunded,
        paymentCount: payments.filter(p => p.status === 'paid').length,
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
