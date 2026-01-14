import { CreditCard, Receipt, ArrowRight, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export default async function BillingPage() {
  const { userId } = await auth();

  // Fetch user's subscriptions
  let subscriptions: Array<{
    id: string;
    status: string;
    plan_id: string;
    plan_name: string;
    current_period_start: string | null;
    current_period_end: string | null;
    created_at: string;
  }> = [];

  if (userId) {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, plan_id, plan_name, current_period_start, current_period_end, created_at')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      subscriptions = data;
    }
  }

  const activeSubscription = subscriptions.find(s => s.status === 'active');
  const hasActiveSubscription = !!activeSubscription;

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

      {/* Membership Plans */}
      <Card className="border-brand/30 bg-gradient-to-br from-brand/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand" />
            Membership Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border bg-white">
              <p className="font-semibold">Monthly Agreement</p>
              <p className="text-2xl font-bold text-brand">$50<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <p className="font-semibold">3 Months Paid-In-Full</p>
              <p className="text-2xl font-bold text-brand">$150<span className="text-sm font-normal text-muted-foreground"> one time</span></p>
              <p className="text-sm text-muted-foreground mt-1">Save vs monthly</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard/checkout" className="flex items-center justify-center gap-2">
              Start Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Active Subscription */}
      {hasActiveSubscription && activeSubscription && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Active Subscription
              </CardTitle>
              <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-white">
              <p className="font-semibold text-lg">{activeSubscription.plan_name}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Started: {activeSubscription.current_period_start 
                    ? new Date(activeSubscription.current_period_start).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              {activeSubscription.current_period_end && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Renews/Ends: {new Date(activeSubscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div 
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      sub.status === 'active' ? 'bg-green-100' : 
                      sub.status === 'canceled' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {sub.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{sub.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      sub.status === 'active' 
                        ? 'border-green-500 text-green-600' 
                        : sub.status === 'canceled'
                        ? 'border-red-500 text-red-600'
                        : 'border-gray-500 text-gray-600'
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No payment history yet
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/checkout">
                  Start your membership
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
