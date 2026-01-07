'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, X, Info, ChevronDown, CreditCard, Check, Circle, Plus, CheckCircle, RefreshCw, Calendar, Receipt } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DEV_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];
const CLIENT_EMAILS = ['info@littlegrapplers.net', 'walkawayy@icloud.com', 'littlegrapplersjitsu@gmail.com'];

interface WorkEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'bugfix' | 'enhancement' | 'maintenance';
  cost: number;
  marketRate: number; // What this would cost at standard agency rates ($150-200/hr)
  justification: string;
  status: 'completed' | 'in-progress' | 'pending';
  paid: boolean;
  paidAt?: string;
  hoursSpent: number;
  deliverables: string[];
  filesModified: string[];
  technicalDetails: string;
}

// Apple-inspired category colors
const categoryStyles = {
  feature: { color: 'text-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' },
  bugfix: { color: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50' },
  enhancement: { color: 'text-orange-500', bg: 'bg-orange-500', light: 'bg-orange-50' },
  maintenance: { color: 'text-gray-500', bg: 'bg-gray-500', light: 'bg-gray-50' },
};

// Initial work entries - these would typically come from a database
const initialWorkEntries: WorkEntry[] = [
  {
    id: '1',
    date: '2026-01-02',
    title: 'Multi-Admin Support',
    description: 'Implemented secure multi-admin authentication system allowing multiple email addresses to access the admin panel. This involved modifying the core authentication flow, adding role-based access control, and ensuring session security across multiple simultaneous admin users.',
    category: 'feature',
    cost: 100,
    marketRate: 438, // 2.5 hrs × $175/hr agency rate
    justification: 'Security-critical feature requiring auth system modifications, role-based access control, and testing across multiple user sessions.',
    status: 'completed',
    paid: false,
    hoursSpent: 2.5,
    deliverables: [
      'Multi-admin email authentication system',
      'Role-based access control (RBAC) implementation',
      'Admin email whitelist configuration',
      'Session management for multiple admin users',
      'Access verification middleware updates',
    ],
    filesModified: [
      'src/lib/constants.ts',
      'src/app/dashboard/admin/page.tsx',
      'src/components/dashboard/dashboard-sidebar.tsx',
      'src/middleware.ts',
    ],
    technicalDetails: 'Implemented secure admin email whitelist in constants.ts supporting multiple admin accounts. Updated all 16 admin dashboard pages to verify against whitelist. Added role-based middleware to protect admin routes. Tested with multiple concurrent admin sessions.',
  },
  {
    id: '2',
    date: '2026-01-02',
    title: 'Contact Email Update',
    description: 'Comprehensive audit and update of all contact email references across the entire platform. Updated contact page, footer component, privacy policy, and terms of service to use the official business email. Created centralized email constant to ensure consistency.',
    category: 'enhancement',
    cost: 50,
    marketRate: 175, // 1 hr × $175/hr agency rate
    justification: 'Updates across 4+ pages including legal documents. Requires careful audit to ensure no references are missed.',
    status: 'completed',
    paid: false,
    hoursSpent: 1,
    deliverables: [
      'Contact page email update',
      'Footer component email link update',
      'Privacy Policy legal document update',
      'Terms of Service legal document update',
      'Global email constant for consistency',
    ],
    filesModified: [
      'src/app/(marketing)/contact/page.tsx',
      'src/components/layout/footer.tsx',
      'src/app/(marketing)/privacy/page.tsx',
      'src/app/(marketing)/terms/page.tsx',
    ],
    technicalDetails: 'Performed full codebase audit using grep search for email references. Updated all instances to info@littlegrapplers.net. Created centralized EMAIL_CONTACT constant to prevent future inconsistencies across updates.',
  },
  {
    id: '3',
    date: '2026-01-02',
    title: 'Location Selector for Enrollment',
    description: 'Built complete location selection feature for the enrollment waiver form. Includes dropdown UI component with 3 pre-configured locations, day-of-week scheduling display, database schema updates, and integration with existing waiver flow and PDF generation.',
    category: 'feature',
    cost: 100,
    marketRate: 438, // 2.5 hrs × $175/hr agency rate
    justification: 'New form field with database schema update, dropdown UI component, and integration with existing waiver submission flow.',
    status: 'completed',
    paid: false,
    hoursSpent: 2.5,
    deliverables: [
      'Location dropdown selector component',
      'Database schema update for location field',
      'Supabase migration script',
      '3 pre-configured locations with schedules',
      'Admin dashboard location display',
      'Waiver PDF generation with location',
    ],
    filesModified: [
      'src/app/(marketing)/enroll/page.tsx',
      'src/app/api/waivers/route.ts',
      'supabase-add-location-to-waiver.sql',
      'src/app/dashboard/admin/students/page.tsx',
    ],
    technicalDetails: 'Built custom location selector with day-of-week scheduling display. Extended Supabase signed_waivers table with location_id column and foreign key constraint. Updated waiver submission API to capture and store location data. Modified admin dashboard to display location assignments.',
  },
  {
    id: '4',
    date: '2026-01-02',
    title: 'Developer Billing Dashboard',
    description: 'Built comprehensive billing dashboard for transparent development tracking. Includes work entry management, real-time cost calculations, Stripe payment integration for one-time and subscription payments, payment history, and detailed platform valuation report.',
    category: 'feature',
    cost: 100,
    marketRate: 525, // 3 hrs × $175/hr agency rate
    justification: 'Full admin page with work log management, Stripe integration, subscription billing, and project valuation report.',
    status: 'completed',
    paid: false,
    hoursSpent: 3,
    deliverables: [
      'Complete billing dashboard page',
      'Work entry management system (CRUD)',
      'Real-time cost calculation',
      'Platform valuation breakdown modal',
      'Stripe payment integration',
      'Monthly subscription management ($30/mo)',
      'Payment history tracking from Stripe',
      'Professional invoice-style layout',
    ],
    filesModified: [
      'src/app/dashboard/admin/developer/page.tsx',
      'src/app/api/payments/developer/route.ts',
      'src/app/api/payments/developer/subscription/route.ts',
      'src/app/api/payments/developer/history/route.ts',
    ],
    technicalDetails: 'Built comprehensive billing dashboard with Apple-inspired UI using Tailwind CSS. Integrated Stripe Checkout for secure one-time payments and recurring subscriptions with billing anchor on 1st of month. Payment history fetches from Stripe API. Includes $99,650 platform valuation breakdown comparing agency rates.',
  },
];

// Detailed breakdown data
const platformModules = [
  { name: 'Marketing Website', detail: '9 pages, SEO, responsive', value: 9600 },
  { name: 'Authentication System', detail: 'Clerk integration, sessions', value: 6200 },
  { name: 'Parent Portal', detail: 'Dashboard, students, settings', value: 13500 },
  { name: 'Admin Dashboard', detail: '16 modules, full CRUD', value: 22600 },
  { name: 'Community Features', detail: 'Forums, discussions, replies', value: 7000 },
  { name: 'Digital Waivers', detail: 'E-signatures, PDF generation', value: 6200 },
  { name: 'API Layer', detail: '44 endpoints, validation', value: 8400 },
  { name: 'Database Design', detail: '20 models, relationships', value: 7000 },
  { name: 'Email System', detail: 'Transactional, notifications', value: 3700 },
  { name: 'UI Components', detail: '30+ custom components', value: 9100 },
  { name: 'Security & Compliance', detail: 'COPPA, RLS policies', value: 4000 },
  { name: 'Infrastructure', detail: 'Vercel, Supabase, CI/CD', value: 2700 },
];

function ValuationDialogContent() {
  const [activeTab, setActiveTab] = useState<'summary' | 'breakdown'>('summary');
  const totalValue = platformModules.reduce((sum, m) => sum + m.value, 0);

  return (
    <DialogContent className="sm:max-w-md p-0 gap-0 border-0 shadow-2xl shadow-black/10 rounded-3xl overflow-hidden [&>button]:hidden">
      {/* Inline Tabs */}
      <div className="flex bg-slate-100 p-1 mx-6 mt-6 rounded-xl">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${
            activeTab === 'summary' 
              ? 'bg-white text-[#1F2A44] shadow-sm' 
              : 'text-[#1F2A44]/50 hover:text-[#1F2A44]/70'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${
            activeTab === 'breakdown' 
              ? 'bg-white text-[#1F2A44] shadow-sm' 
              : 'text-[#1F2A44]/50 hover:text-[#1F2A44]/70'
          }`}
        >
          Full Breakdown
        </button>
      </div>

      {activeTab === 'summary' ? (
        <>
          {/* Summary View */}
          <div className="pt-6 pb-4 px-8 text-center">
            <DialogHeader>
              <DialogTitle className="text-[28px] font-semibold text-[#1F2A44] tracking-tight">
                $99,650 saved
              </DialogTitle>
            </DialogHeader>
            <p className="text-[14px] text-[#1F2A44]/50 mt-1">vs. traditional agency pricing</p>
          </div>
          
          <div className="px-8 py-6">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <p className="text-[32px] font-light text-[#1F2A44]/25 line-through decoration-[#1F2A44]/15">$100k</p>
                <p className="text-[13px] text-[#1F2A44]/40 mt-1">Agency</p>
              </div>
              <div className="w-px h-12 bg-[#1F2A44]/10" />
              <div className="flex-1">
                <p className="text-[32px] font-semibold text-[#1F2A44]">$350</p>
                <p className="text-[13px] text-[#2EC4B6] mt-1">You paid</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-[#F7F9F9] border-t border-[#1F2A44]/5 text-center">
            <p className="text-[13px] text-[#1F2A44]/50">12 modules · ~$30/mo hosting</p>
          </div>
        </>
      ) : (
        <>
          {/* Breakdown View */}
          <div className="pt-4 pb-2 px-8">
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-[#1F2A44] tracking-tight">
                Agency Pricing
              </DialogTitle>
            </DialogHeader>
            <p className="text-[13px] text-[#1F2A44]/40">What this would cost elsewhere</p>
          </div>
          
          <div className="px-8 py-3 max-h-[45vh] overflow-y-auto">
            <div className="space-y-0">
              {platformModules.map((module, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#1F2A44]/5 last:border-0">
                  <div>
                    <p className="text-[13px] font-medium text-[#1F2A44]">{module.name}</p>
                    <p className="text-[11px] text-[#1F2A44]/40">{module.detail}</p>
                  </div>
                  <p className="text-[13px] font-medium text-[#1F2A44]/60">${module.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-4 bg-[#F7F9F9] border-t border-[#1F2A44]/5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#1F2A44]">Total Value</span>
              <span className="text-[16px] font-semibold text-[#1F2A44]">${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  );
}

export default function DeveloperBillingPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const canEdit = DEV_EMAILS.includes(userEmail || '');
  const isClient = CLIENT_EMAILS.includes(userEmail || '');
  
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devWorkEntries');
      return saved ? JSON.parse(saved) : initialWorkEntries;
    }
    return initialWorkEntries;
  });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(false);
  const [subscription, setSubscription] = useState<{
    id: string;
    status: string;
    currentPeriodEnd: string;
    amount: number;
  } | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string;
    type: 'one_time' | 'subscription';
    amount: number;
    status: string;
    description: string;
    date: string;
  }>>([]);
  const [historyTotals, setHistoryTotals] = useState({ all: 0, subscription: 0, oneTime: 0 });

  // Persist work entries to localStorage
  useEffect(() => {
    localStorage.setItem('devWorkEntries', JSON.stringify(workEntries));
  }, [workEntries]);
  const [newEntry, setNewEntry] = useState<Partial<WorkEntry>>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category: 'feature',
    cost: 50,
    justification: '',
    status: 'completed',
  });

  // Fetch subscription status and payment history
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [subRes, historyRes] = await Promise.all([
          fetch('/api/payments/developer/subscription'),
          fetch('/api/payments/developer/history'),
        ]);
        
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData.subscription);
        }
        
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setPaymentHistory(historyData.payments || []);
          setHistoryTotals(historyData.totals || { all: 0, subscription: 0, oneTime: 0 });
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      }
    };
    
    fetchBillingData();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const subscriptionStatus = searchParams.get('subscription');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      setShowPaymentSuccess(true);
      setWorkEntries(prev => prev.map(entry => 
        !entry.paid ? { ...entry, paid: true, paidAt: new Date().toISOString() } : entry
      ));
      window.history.replaceState({}, '', '/dashboard/admin/developer');
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    }
    
    if (subscriptionStatus === 'success' && sessionId) {
      setShowSubscriptionSuccess(true);
      // Refetch subscription status
      fetch('/api/payments/developer/subscription')
        .then(res => res.json())
        .then(data => setSubscription(data.subscription))
        .catch(console.error);
      window.history.replaceState({}, '', '/dashboard/admin/developer');
      setTimeout(() => setShowSubscriptionSuccess(false), 5000);
    }
  }, [searchParams]);

  const handlePayDeveloper = async () => {
    if (unpaidTotal <= 0) return;
    
    setProcessingPayment(true);
    try {
      const response = await fetch('/api/payments/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: unpaidTotal,
          description: `Developer payment for ${unpaidEntries.length} tasks`,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Payment error:', error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubscribe = async () => {
    setProcessingSubscription(true);
    try {
      const response = await fetch('/api/payments/developer/subscription', {
        method: 'POST',
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Subscription error:', error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setProcessingSubscription(false);
    }
  };

  // Calculate totals
  const totalCost = workEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const unpaidEntries = workEntries.filter(e => !e.paid);
  const paidEntries = workEntries.filter(e => e.paid);
  const unpaidTotal = unpaidEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const paidTotal = paidEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const completedEntries = workEntries.filter(e => e.status === 'completed').length;

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.description) return;
    
    const cost = newEntry.cost || 50;
    const hours = Math.max(1, cost / 40); // Estimate hours based on $40/hr rate
    const entry: WorkEntry = {
      id: Date.now().toString(),
      date: newEntry.date || new Date().toISOString().split('T')[0],
      title: newEntry.title || '',
      description: newEntry.description || '',
      category: newEntry.category as WorkEntry['category'] || 'feature',
      cost: cost,
      marketRate: Math.round(hours * 175), // $175/hr agency rate
      justification: newEntry.justification || '',
      status: newEntry.status as WorkEntry['status'] || 'completed',
      paid: false,
      hoursSpent: hours,
      deliverables: [],
      filesModified: [],
      technicalDetails: '',
    };
    
    setWorkEntries([entry, ...workEntries]);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      category: 'feature',
      cost: 50,
      justification: '',
      status: 'completed',
    });
    setIsAddingEntry(false);
  };

  const handleDeleteEntry = (id: string) => {
    setWorkEntries(workEntries.filter(e => e.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header - Apple Clean */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Work Log
        </h1>
        <p className="text-gray-500 mt-1">Development history and billing</p>
      </div>

      {/* Billing Summary - Apple Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">One-time</p>
          <p className="text-xl font-semibold text-gray-900">$350</p>
          <p className="text-xs text-gray-500 mt-1">Platform build</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly</p>
          <p className="text-xl font-semibold text-gray-900">$30</p>
          <p className="text-xs text-gray-500 mt-1">Hosting costs</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">New Features</p>
          <p className="text-xl font-semibold text-gray-900">$0+</p>
          <p className="text-xs text-gray-500 mt-1">Only if requested</p>
        </div>
      </div>

      {/* Payment Success Message */}
      {showPaymentSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-gray-900">Payment successful! Thank you.</p>
        </div>
      )}

      {/* Subscription Success Message */}
      {showSubscriptionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-gray-900">Subscription activated! Thank you for your support.</p>
        </div>
      )}

      {/* Monthly Hosting - Slim Banner */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Monthly Hosting</p>
              <p className="text-sm text-gray-500">$30/mo · Due 1st of each month</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Countdown */}
            {(() => {
              const now = new Date();
              const nextFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              const daysUntil = Math.ceil((nextFirst.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div className="text-center">
                  <p className="text-xl font-light text-gray-300">{daysUntil}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">days</p>
                </div>
              );
            })()}
            
            {subscription ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50">
                {subscription.status === 'active' ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">Active</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-600">Due</span>
                  </>
                )}
              </div>
            ) : (
              isClient && (
                <button
                  onClick={handleSubscribe}
                  disabled={processingSubscription}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {processingSubscription ? 'Processing...' : 'Pay Now'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Platform Build Card - Full width with integrated history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">One-time</p>
                  <p className="font-semibold text-gray-900">Platform Build</p>
                </div>
              </div>
              <p className="text-3xl font-semibold text-gray-900">{formatCurrency(unpaidTotal)}</p>
            </div>
            
            {unpaidTotal > 0 && isClient && (
              <button
                onClick={handlePayDeveloper}
                disabled={processingPayment}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {processingPayment ? 'Processing...' : 'Pay Now'}
              </button>
            )}
            
            {unpaidTotal === 0 && (
              <div className="flex items-center gap-2 py-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-600">Paid</span>
              </div>
            )}
          </div>
          
          {/* Integrated Work History */}
          <div className="border-t border-gray-100">
            <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Work Completed</p>
              <p className="text-xs text-gray-400">{workEntries.length} items</p>
            </div>

            <div className="divide-y divide-gray-100">
              {workEntries.map((entry) => {
                const isPaid = entry.paid;
                const style = categoryStyles[entry.category];
                const isExpanded = editingId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`${isPaid ? 'opacity-60' : ''}`}
                  >
                    <div 
                      className="px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setEditingId(isExpanded ? null : entry.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${style.light} ${style.color}`}>
                              {entry.category}
                            </span>
                            {entry.hoursSpent && <span className="text-xs text-gray-400">{entry.hoursSpent} hrs</span>}
                          </div>
                          <p className={`font-medium ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {entry.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{entry.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-lg font-semibold ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {formatCurrency(entry.cost)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                          {/* Deliverables */}
                          {entry.deliverables && entry.deliverables.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">What was delivered</p>
                              <ul className="space-y-1.5">
                                {entry.deliverables.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Technical Details */}
                          {entry.technicalDetails && (
                            <div className="p-3 rounded-lg bg-slate-50">
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Summary</p>
                              <p className="text-sm text-gray-600">{entry.technicalDetails}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>

      {/* Full Platform Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">What Was Built</h2>
          <p className="text-sm text-gray-500 mt-0.5">Complete platform breakdown</p>
        </div>
        <div className="divide-y divide-gray-100">
          {platformModules.map((module, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{module.name}</p>
                <p className="text-xs text-gray-500">{module.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Components</span>
            <span className="text-sm font-semibold text-gray-900">{platformModules.length} modules</span>
          </div>
        </div>
      </div>

      {/* Add Entry Button */}
      {canEdit && !isAddingEntry && (
        <button
          onClick={() => setIsAddingEntry(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Entry</span>
        </button>
      )}

      {/* Add Entry Form */}
      {isAddingEntry && canEdit && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-gray-900">New Entry</h2>
            <button onClick={() => setIsAddingEntry(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="What did you work on?"
                className="rounded-xl border-gray-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Describe the work..."
                rows={2}
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                <Input
                  type="number"
                  step="50"
                  min="0"
                  value={newEntry.cost}
                  onChange={(e) => setNewEntry({ ...newEntry, cost: parseInt(e.target.value) || 0 })}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as WorkEntry['category'] })}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="feature">Feature</option>
                  <option value="bugfix">Bug Fix</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
              <Textarea
                value={newEntry.justification}
                onChange={(e) => setNewEntry({ ...newEntry, justification: e.target.value })}
                placeholder="Why does this cost what it does?"
                rows={2}
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setIsAddingEntry(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddEntry}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium text-gray-900">Payment History</h2>
            <span className="text-sm text-gray-500">
              Total paid: {formatCurrency(historyTotals.all)}
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  payment.type === 'subscription' ? 'bg-slate-100' : 'bg-blue-50'
                }`}>
                  {payment.type === 'subscription' ? (
                    <RefreshCw className="h-5 w-5 text-slate-600" />
                  ) : (
                    <Receipt className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{payment.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(payment.date)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      payment.type === 'subscription' 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {payment.type === 'subscription' ? 'Subscription' : 'One-time'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-600">
                    {formatCurrency(payment.amount)}
                  </span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-6">
        {canEdit ? 'You have edit access' : 'View only'}
      </p>

      {/* Platform Valuation */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full group">
              <div className="flex items-center justify-center gap-2 py-3 text-sm">
                <span className="text-gray-400">Platform value saved:</span>
                <span className="font-medium text-emerald-600">$99,650</span>
                <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>
            </button>
          </DialogTrigger>
          <ValuationDialogContent />
        </Dialog>
      </div>
    </div>
  );
}
