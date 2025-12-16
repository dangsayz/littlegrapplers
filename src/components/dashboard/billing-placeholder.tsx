import { CreditCard, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BillingPlaceholderProps {
  parentAddress?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
}

export function BillingPlaceholder({ parentAddress }: BillingPlaceholderProps) {
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
                Online payments coming soon. Contact us for billing inquiries.
              </p>
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
      </CardContent>
    </Card>
  );
}
