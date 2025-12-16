# Task: Stripe Payments Integration

> **Status:** Blocked (Waiting on Client)  
> **Priority:** High  
> **Estimated Effort:** 6-8 hours

---

## Overview

Integrate Stripe for membership payments, subscriptions, and billing management.

---

## Blocking Requirements

**Client must provide:**
- [ ] Stripe account created and verified
- [ ] Publishable Key (pk_live_xxx or pk_test_xxx)
- [ ] Secret Key (sk_live_xxx or sk_test_xxx)
- [ ] Webhook signing secret

---

## Requirements

### Stripe Setup
- [ ] Configure Stripe keys in environment
- [ ] Create Stripe utility functions
- [ ] Set up webhook endpoint

### Products & Prices
- [ ] Create membership products in Stripe
- [ ] Set up monthly subscription prices
- [ ] Handle multiple location/program pricing

### Checkout Flow
- [ ] Checkout session creation
- [ ] Success/cancel redirect pages
- [ ] Subscription confirmation

### Subscription Management
- [ ] View active subscription
- [ ] Update payment method
- [ ] Cancel subscription
- [ ] Pause/resume subscription

### Webhooks
- [ ] `checkout.session.completed` - Activate membership
- [ ] `invoice.paid` - Record payment
- [ ] `invoice.payment_failed` - Notify user
- [ ] `customer.subscription.updated` - Sync status
- [ ] `customer.subscription.deleted` - Deactivate membership

### Admin Features
- [ ] View all subscriptions
- [ ] Manual subscription management
- [ ] Revenue dashboard

---

## Environment Variables

```
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/checkout` | Create checkout session |
| POST | `/api/stripe/webhook` | Handle Stripe webhooks |
| GET | `/api/stripe/subscription` | Get user's subscription |
| POST | `/api/stripe/portal` | Create billing portal session |

---

## File Structure

```
src/
├── app/
│   ├── api/stripe/
│   │   ├── checkout/route.ts
│   │   ├── webhook/route.ts
│   │   ├── subscription/route.ts
│   │   └── portal/route.ts
│   └── dashboard/
│       └── billing/
│           ├── page.tsx
│           ├── success/page.tsx
│           └── cancel/page.tsx
└── lib/
    └── stripe.ts
```

---

## Acceptance Criteria

- [ ] Parents can subscribe to memberships
- [ ] Recurring billing works automatically
- [ ] Failed payments trigger notifications
- [ ] Parents can manage their subscription
- [ ] Admin can view all subscriptions
- [ ] Webhooks properly sync data

---

*Created: December 2024*
