'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CreditCard, Shield, Loader2, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, type PlanId } from '@/lib/stripe';

interface CheckoutClientProps {
  clerkUserId: string;
  userEmail: string;
  userName: string;
  childName: string;
  locationName: string | null;
  waiverId: string;
}

export function CheckoutClient({
  clerkUserId,
  userEmail,
  userName,
  childName,
  locationName,
  waiverId,
}: CheckoutClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          clerkUserId,
          userEmail,
          waiverId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Complete Your Enrollment
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a membership plan for {childName}
          {locationName && ` at ${locationName}`}
        </p>
      </div>

      {/* Enrollment Summary */}
      <Card className="bg-brand/5 border-brand/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <Check className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-medium text-foreground">Waiver Signed</p>
              <p className="text-sm text-muted-foreground">
                {childName} is ready to start training
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, plan]) => (
          <Card
            key={id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === id
                ? 'border-brand ring-2 ring-brand/20'
                : 'border-border hover:border-brand/50'
            } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            onClick={() => setSelectedPlan(id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand text-white text-xs font-bold">
                  <Zap className="h-3 w-3" />
                  POPULAR
                </span>
              </div>
            )}
            
            <CardHeader className={plan.popular ? 'pt-8' : ''}>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === id
                      ? 'border-brand bg-brand'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {selectedPlan === id && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.interval === 'month' && (
                  <span className="text-muted-foreground">/month</span>
                )}
                {plan.interval === 'one_time' && (
                  <span className="text-muted-foreground">one time</span>
                )}
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Checkout Button */}
      <div className="flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full bg-brand hover:bg-brand/90 text-white h-14 text-lg"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Continue to Payment - ${PLANS[selectedPlan].price}
              {PLANS[selectedPlan].interval === 'month' && '/mo'}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}
