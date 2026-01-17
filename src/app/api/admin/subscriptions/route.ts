import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

// GET: List all subscriptions from Stripe
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch subscriptions from Stripe
    const subscriptionParams: Record<string, unknown> = { limit, expand: ['data.customer'] };
    if (status !== 'all') {
      subscriptionParams.status = status;
    }

    const subscriptions = await stripe.subscriptions.list(subscriptionParams);

    // Format subscriptions for frontend
    const formattedSubscriptions = subscriptions.data.map(sub => {
      const customer = sub.customer as { email?: string; name?: string; id: string };
      const subAny = sub as unknown as Record<string, unknown>;
      return {
        id: sub.id,
        customerId: customer.id,
        customerEmail: customer.email || 'Unknown',
        customerName: customer.name || 'Unknown',
        status: sub.status,
        currentPeriodStart: subAny.current_period_start ? new Date((subAny.current_period_start as number) * 1000).toISOString() : null,
        currentPeriodEnd: subAny.current_period_end ? new Date((subAny.current_period_end as number) * 1000).toISOString() : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        created: new Date(sub.created * 1000).toISOString(),
        amount: sub.items.data[0]?.price?.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 0,
        interval: sub.items.data[0]?.price?.recurring?.interval || 'month',
        metadata: sub.metadata,
      };
    });

    return NextResponse.json({ 
      subscriptions: formattedSubscriptions,
      hasMore: subscriptions.has_more,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST: Perform actions on subscriptions (cancel, pause, resume, update billing)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    const body = await request.json();
    const { action, subscriptionId, dryRun, ...params } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    // DRY RUN MODE - Validate without executing
    if (dryRun) {
      // Verify the subscription exists first
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      
      const actionDescriptions: Record<string, string> = {
        'cancel': `Will mark subscription to cancel at end of billing period (${new Date((sub as unknown as Record<string, number>).current_period_end * 1000).toLocaleDateString()})`,
        'cancel_immediately': 'Will cancel subscription IMMEDIATELY - customer loses access now',
        'resume': 'Will remove the scheduled cancellation - subscription continues normally',
        'pause': 'Will pause billing collection - subscription stays active but no charges',
        'unpause': 'Will resume billing collection',
        'charge_now': 'Will create and charge an invoice immediately',
      };
      
      return NextResponse.json({
        success: true,
        dryRun: true,
        action,
        subscriptionId,
        customerEmail: (sub.customer as { email?: string })?.email || 'Unknown',
        currentStatus: sub.status,
        description: actionDescriptions[action] || 'Unknown action',
        wouldExecute: `stripe.subscriptions.${action === 'cancel_immediately' ? 'cancel' : 'update'}(${subscriptionId}, ...)`,
      });
    }

    let result;

    switch (action) {
      case 'cancel':
        // Cancel at end of billing period (graceful)
        result = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        break;

      case 'cancel_immediately':
        // Cancel immediately
        result = await stripe.subscriptions.cancel(subscriptionId);
        break;

      case 'resume':
        // Resume a subscription that was set to cancel
        result = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
        break;

      case 'pause':
        // Pause collection (subscription stays active but no charges)
        result = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: {
            behavior: 'void',
          },
        });
        break;

      case 'unpause':
        // Resume collection
        result = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: null,
        });
        break;

      case 'update_billing_anchor':
        // Change the billing date - use trial end as workaround
        const { billingCycleAnchor } = params;
        if (!billingCycleAnchor) {
          return NextResponse.json({ error: 'Billing cycle anchor required' }, { status: 400 });
        }
        const newAnchor = Math.floor(new Date(billingCycleAnchor).getTime() / 1000);
        result = await stripe.subscriptions.update(subscriptionId, {
          trial_end: newAnchor,
          proration_behavior: 'none',
        });
        break;

      case 'charge_now':
        // Create an invoice and charge immediately
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const invoice = await stripe.invoices.create({
          customer: subscription.customer as string,
          subscription: subscriptionId,
          auto_advance: true,
        });
        result = await stripe.invoices.pay(invoice.id);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the action (optional - table might not exist)
    try {
      await supabaseAdmin.from('admin_audit_log').insert({
        admin_email: userEmail,
        action: `subscription_${action}`,
        target_id: subscriptionId,
        details: JSON.stringify({ action, params }),
        created_at: new Date().toISOString(),
      });
    } catch {
      // Audit log table might not exist, ignore
    }

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: result.id,
        status: result.status || result.object,
      },
    });
  } catch (error: unknown) {
    console.error('Error managing subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to manage subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
