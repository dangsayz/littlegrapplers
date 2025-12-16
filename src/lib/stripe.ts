import Stripe from 'stripe';

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Price IDs - you'll create these in Stripe Dashboard
export const PRICE_IDS = {
  // Monthly subscription - $50/month
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  // 3-month paid-in-full - $150 one-time
  threeMonth: process.env.STRIPE_PRICE_THREE_MONTH || 'price_three_month_placeholder',
} as const;

export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Agreement',
    price: 50,
    interval: 'month' as const,
    priceId: PRICE_IDS.monthly,
    description: 'Flexible monthly billing',
    features: [
      'Weekly BJJ classes at daycare',
      'Over 20 hours of video content',
      'Community access',
      'Cancel anytime',
    ],
    popular: true,
  },
  threeMonth: {
    id: 'threeMonth',
    name: '3 Months Paid-In-Full',
    price: 150,
    interval: 'one_time' as const,
    priceId: PRICE_IDS.threeMonth,
    description: 'Best value - save $50',
    features: [
      'Full access for 3 months',
      'No recurring charges',
      'All membership benefits',
      'Priority support',
    ],
    popular: false,
  },
} as const;

export type PlanId = keyof typeof PLANS;
