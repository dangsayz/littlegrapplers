import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getStripeCustomerId = async (email: string, name?: string): Promise<string> => {
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  });

  return customer.id;
};

export const createPaymentIntent = async ({
  amount,
  customerId,
  metadata,
}: {
  amount: number;
  customerId: string;
  metadata?: Record<string, string>;
}) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: customerId,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

export const createCheckoutSession = async ({
  customerId,
  lineItems,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  lineItems: Array<{
    name: string;
    amount: number;
    quantity?: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.amount * 100),
      },
      quantity: item.quantity || 1,
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) => {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};
