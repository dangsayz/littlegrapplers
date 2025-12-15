import { CreditCard, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * BILLING INTEGRATION TODO
 * ========================
 * 
 * This placeholder needs to be replaced with actual Stripe integration.
 * 
 * STEPS TO INTEGRATE:
 * 
 * 1. Install Stripe:
 *    npm install stripe @stripe/stripe-js
 * 
 * 2. Add environment variables:
 *    STRIPE_SECRET_KEY=sk_live_...
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 * 
 * 3. Create Stripe customer on user signup:
 *    - In your signup flow, call stripe.customers.create()
 *    - Store the customer ID in Parent.stripeCustomerId
 * 
 * 4. Create billing portal session for self-service:
 *    - stripe.billingPortal.sessions.create()
 *    - Redirect user to manage payment methods, view invoices
 * 
 * 5. Display payment method info:
 *    - stripe.customers.retrieve() with expand: ['default_source']
 *    - Show last 4 digits of card
 * 
 * 6. Set up webhook handlers for:
 *    - customer.subscription.created
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 *    - invoice.paid
 *    - invoice.payment_failed
 * 
 * RESOURCES:
 * - Stripe Billing: https://stripe.com/docs/billing
 * - Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
 * - Next.js + Stripe: https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript
 */

interface BillingPlaceholderProps {
  parentAddress?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
  hasStripeCustomer?: boolean;
}

export function BillingPlaceholder({ parentAddress, hasStripeCustomer }: BillingPlaceholderProps) {
  const hasAddress = parentAddress?.address && parentAddress?.city;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand" />
            Billing & Payment
          </CardTitle>
        </div>
        <Badge variant="secondary">Coming Soon</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Section */}
        <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Payment Method</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Stripe integration pending. Once connected, you&apos;ll be able to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>View and update your payment method</li>
                <li>See payment history and invoices</li>
                <li>Manage subscription settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center justify-between">
            Billing Address
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/settings">Edit</a>
            </Button>
          </h4>
          {hasAddress ? (
            <div className="text-sm text-muted-foreground">
              <p>{parentAddress?.address}</p>
              <p>
                {parentAddress?.city}, {parentAddress?.state} {parentAddress?.zip}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No billing address on file.{' '}
              <a href="/dashboard/settings" className="text-brand hover:underline">
                Add one in settings
              </a>
            </p>
          )}
        </div>

        {/* Dev Notes - Only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-medium text-sm text-yellow-600 dark:text-yellow-400 mb-2">
              🛠 Developer Notes
            </h4>
            <p className="text-xs text-muted-foreground">
              See <code className="bg-muted px-1 rounded">src/components/dashboard/billing-placeholder.tsx</code> for 
              integration instructions. Parent.stripeCustomerId field is ready in the schema.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://stripe.com/docs/billing/subscriptions/customer-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Stripe Docs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
