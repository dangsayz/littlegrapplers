/**
 * Billing Ledger Aggregator
 * 
 * Provides unified billing summary with proper categorization:
 * - Recurring subscriptions (monthly hosting)
 * - Overdue items (past due maintenance, invoices)
 * - One-time work orders/invoices
 * 
 * Computes canonical totals:
 * - past_due_total: sum of all overdue items
 * - due_now_total: sum of items due today or overdue
 * - upcoming_total: next recurring charges not yet due
 */

export type BillingItemType = 'subscription' | 'maintenance' | 'work_order' | 'invoice';
export type BillingItemStatus = 'active' | 'pending' | 'overdue' | 'paid' | 'cancelled';

export interface BillingItem {
  id: string;
  type: BillingItemType;
  description: string;
  amount: number;
  status: BillingItemStatus;
  due_date: string | null;
  paid_at: string | null;
  interval?: 'monthly' | 'one_time';
  next_bill_at?: string | null;
  created_at: string;
}

export interface BillingSummary {
  // Categorized items
  pastDueItems: BillingItem[];
  dueNowItems: BillingItem[];
  upcomingItems: BillingItem[];
  
  // Totals
  totals: {
    past_due: number;
    due_now: number;
    upcoming: number;
    total_owed: number;
  };
  
  // Subscription status
  subscription: {
    active: boolean;
    amount: number;
    interval: 'monthly';
    next_bill_at: string | null;
    status: 'active' | 'paused' | 'cancelled' | 'none';
    paused_reason?: string;
  };
  
  // Flags for UI
  hasOverdue: boolean;
  daysUntilNextPayment: number | null;
}

// Platform billing configuration
export const BILLING_CONFIG = {
  // Recurring subscription
  monthlyHosting: {
    amount: 60, // $60/mo for Supabase + Vercel infrastructure
    description: 'Monthly Hosting - Supabase + Vercel infrastructure',
    interval: 'monthly' as const,
  },
  
  // One-time fees
  maintenanceFee: {
    amount: 30,
    description: 'Platform Maintenance Fee',
  },
} as const;

/**
 * Get billing summary for a tenant
 * Aggregates all billing items and computes totals
 */
export function getBillingSummary(
  workOrders: Array<{
    id: string;
    title: string;
    quoted_cost: number | null;
    status: string;
    paid: boolean;
    paid_at: string | null;
    completed_at: string | null;
    created_at: string;
  }>,
  subscription: {
    active: boolean;
    amount: number;
    currentPeriodEnd: string | null;
    status: string;
  } | null,
  overdueItems: Array<{
    id: string;
    type: BillingItemType;
    description: string;
    amount: number;
    due_date: string;
  }> = []
): BillingSummary {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Initialize arrays
  const pastDueItems: BillingItem[] = [];
  const dueNowItems: BillingItem[] = [];
  const upcomingItems: BillingItem[] = [];
  
  // Process overdue items (maintenance fees, etc.)
  for (const item of overdueItems) {
    const dueDate = new Date(item.due_date);
    const billingItem: BillingItem = {
      id: item.id,
      type: item.type,
      description: item.description,
      amount: item.amount,
      status: 'overdue',
      due_date: item.due_date,
      paid_at: null,
      interval: 'one_time',
      created_at: item.due_date,
    };
    
    if (dueDate < today) {
      pastDueItems.push(billingItem);
    } else if (dueDate.getTime() === today.getTime()) {
      dueNowItems.push(billingItem);
    }
  }
  
  // Process unpaid work orders
  const unpaidWorkOrders = workOrders.filter(
    wo => wo.status === 'completed' && !wo.paid && wo.quoted_cost && wo.quoted_cost > 0
  );
  
  for (const wo of unpaidWorkOrders) {
    const billingItem: BillingItem = {
      id: wo.id,
      type: 'work_order',
      description: wo.title,
      amount: wo.quoted_cost || 0,
      status: 'pending',
      due_date: wo.completed_at,
      paid_at: null,
      interval: 'one_time',
      created_at: wo.created_at,
    };
    
    // Work orders are due when completed
    dueNowItems.push(billingItem);
  }
  
  // Process subscription
  let subscriptionStatus: BillingSummary['subscription'] = {
    active: false,
    amount: BILLING_CONFIG.monthlyHosting.amount,
    interval: 'monthly',
    next_bill_at: null,
    status: 'none',
  };
  
  if (subscription) {
    const nextBillDate = subscription.currentPeriodEnd 
      ? new Date(subscription.currentPeriodEnd) 
      : getFirstOfNextMonth();
    
    subscriptionStatus = {
      active: subscription.active && subscription.status === 'active',
      amount: subscription.amount || BILLING_CONFIG.monthlyHosting.amount,
      interval: 'monthly',
      next_bill_at: nextBillDate.toISOString(),
      status: subscription.active ? 'active' : 'paused',
      paused_reason: !subscription.active ? 'Payment required' : undefined,
    };
    
    // Add upcoming subscription charge
    if (subscriptionStatus.active) {
      upcomingItems.push({
        id: 'subscription-next',
        type: 'subscription',
        description: BILLING_CONFIG.monthlyHosting.description,
        amount: subscriptionStatus.amount,
        status: 'pending',
        due_date: subscriptionStatus.next_bill_at,
        paid_at: null,
        interval: 'monthly',
        next_bill_at: subscriptionStatus.next_bill_at,
        created_at: new Date().toISOString(),
      });
    }
  }
  
  // Calculate totals
  const pastDueTotal = pastDueItems.reduce((sum, item) => sum + item.amount, 0);
  const dueNowTotal = dueNowItems.reduce((sum, item) => sum + item.amount, 0);
  const upcomingTotal = upcomingItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate days until next payment (only if nothing overdue)
  let daysUntilNextPayment: number | null = null;
  if (subscriptionStatus.next_bill_at && pastDueTotal === 0) {
    const nextBill = new Date(subscriptionStatus.next_bill_at);
    const diffTime = nextBill.getTime() - today.getTime();
    daysUntilNextPayment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  return {
    pastDueItems,
    dueNowItems,
    upcomingItems,
    totals: {
      past_due: pastDueTotal,
      due_now: pastDueTotal + dueNowTotal, // Include past due in due now
      upcoming: upcomingTotal,
      total_owed: pastDueTotal + dueNowTotal,
    },
    subscription: subscriptionStatus,
    hasOverdue: pastDueTotal > 0,
    daysUntilNextPayment,
  };
}

/**
 * Get the first day of next month
 */
function getFirstOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get days until a date
 */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
