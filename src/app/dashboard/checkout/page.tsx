'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, CreditCard, Shield, Clock, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PLANS = [
  {
    id: '3month',
    name: '3 Months Paid-In-Full',
    price: 150,
    priceDisplay: '$150',
    period: 'one time',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_3MONTH,
    planType: '3month',
    features: [
      'Full access for 3 months',
      'No recurring charges',
      'All membership benefits',
      'Save vs monthly',
    ],
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Agreement',
    price: 50,
    priceDisplay: '$50',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
    planType: 'monthly',
    features: [
      'Weekly jiu-jitsu classes',
      'Access to parent community',
      'Progress tracking',
      'Cancel anytime',
    ],
    popular: true,
  },
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelled = searchParams.get('cancelled');

  useEffect(() => {
    if (cancelled) {
      setError('No worries! Your spot is saved. Complete your membership when you\'re ready.');
    }
  }, [cancelled]);

  const handleCheckout = async () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planType: plan.planType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select the membership that works best for your family
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand/5 border border-brand/20 flex items-center gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-brand" />
            </div>
            <p className="text-foreground/80 text-sm">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedPlan === plan.id
                  ? 'border-brand ring-2 ring-brand/20'
                  : 'border-border hover:border-brand/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-brand text-white text-xs font-semibold">
                    POPULAR
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.priceDisplay}
                      </span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlan === plan.id
                        ? 'border-brand bg-brand'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10">
                        <Check className="h-3 w-3 text-brand" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="w-full max-w-md h-14 text-lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Continue to Payment
              </span>
            )}
          </Button>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Instant access
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
