import { CreditCard, Receipt, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockAddress = {
  address: '123 Main Street',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
};

export default async function BillingPage() {
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

      {/* Coming Soon Notice */}
      <Card className="border-brand/30 bg-brand/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand mt-0.5" />
            <div>
              <p className="font-medium text-brand">
                Coming Soon
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Online payment processing will be available soon. For now, please contact us directly for billing inquiries.
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
          <Badge variant="secondary">Coming Soon</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No payment method on file
            </p>
            <Button disabled>
              Add Payment Method
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Available soon
            </p>
          </div>
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

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No payment history yet
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
