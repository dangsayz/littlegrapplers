import { CreditCard, Receipt, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * BILLING PAGE - STRIPE INTEGRATION TODO
 * ======================================
 * 
 * This page needs Stripe integration to be functional.
 * See src/components/dashboard/billing-placeholder.tsx for detailed instructions.
 * 
 * IMPLEMENTATION STEPS:
 * 
 * 1. Set up Stripe account and get API keys
 * 2. Install: npm install stripe @stripe/stripe-js
 * 3. Create API routes for:
 *    - POST /api/stripe/create-portal-session (redirect to Stripe portal)
 *    - POST /api/stripe/create-checkout-session (for new subscriptions)
 *    - POST /api/webhooks/stripe (handle Stripe events)
 * 
 * 4. On this page, fetch:
 *    - Customer's payment methods from Stripe
 *    - Recent invoices from Stripe
 *    - Active subscriptions
 * 
 * 5. Add "Manage Payment Method" button that redirects to Stripe Customer Portal
 */

// TODO: Replace with actual data from Stripe
const mockPaymentMethod = null; // Will be { last4: '4242', brand: 'visa', expMonth: 12, expYear: 2025 }
const mockInvoices: Array<{
  id: string;
  amount: number;
  status: string;
  date: Date;
  pdfUrl: string;
}> = [];

const mockAddress = {
  address: '123 Main Street',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
};

export default async function BillingPage() {
  const paymentMethod = mockPaymentMethod;
  const invoices = mockInvoices;
  const address = mockAddress;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-brand" />
          Billing & Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your payment method and view invoices
        </p>
      </div>

      {/* Integration Notice */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                Stripe Integration Required
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Payment processing is not yet configured. Once Stripe is connected, 
                you&apos;ll be able to manage your payment method and view invoices here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand" />
            Payment Method
          </CardTitle>
          <Badge variant="secondary">Pending Setup</Badge>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {paymentMethod} •••• {/* last4 */}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {/* expMonth/expYear */}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No payment method on file
              </p>
              <Button disabled>
                Add Payment Method
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Available once Stripe is configured
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Billing Address</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/settings">Edit</a>
          </Button>
        </CardHeader>
        <CardContent>
          {address.address ? (
            <div className="text-muted-foreground">
              <p>{address.address}</p>
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No billing address on file.{' '}
              <a href="/dashboard/settings" className="text-brand hover:underline">
                Add one in settings
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      ${(invoice.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'success' : 'warning'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No payment history yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Notes - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              🛠 Developer Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>To integrate Stripe:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create Stripe account at stripe.com</li>
              <li>Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env</li>
              <li>Install stripe and @stripe/stripe-js packages</li>
              <li>Create /api/stripe/* API routes</li>
              <li>Set up webhook endpoint at /api/webhooks/stripe</li>
              <li>Use Stripe Customer Portal for payment management</li>
            </ol>
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://stripe.com/docs/billing/subscriptions/build-subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Stripe Subscriptions Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
