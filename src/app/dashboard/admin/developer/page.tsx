'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, X, ChevronDown, Check, Plus, CheckCircle, RefreshCw, Calendar, Receipt, MessageCircle, Clock, AlertCircle, Send, DollarSign, Loader2, Mail, Bell, CalendarClock, Settings2, Eye, MousePointer, Search, Activity, UserCircle, CreditCard } from 'lucide-react';
import { BILLING_CONFIG, getBillingSummary, formatCurrency as formatBillingCurrency, type BillingSummary } from '@/lib/billing-ledger';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'feature' | 'bugfix' | 'enhancement' | 'maintenance';
  quoted_cost: number | null;
  quoted_hours: number | null;
  developer_notes: string | null;
  status: 'requested' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  paid: boolean;
  paid_at: string | null;
  requested_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deliverables: string[] | null;
  files_modified: string[] | null;
  technical_summary: string | null;
}

interface WorkOrderComment {
  id: string;
  work_order_id: string;
  author_email: string;
  content: string;
  created_at: string;
}

// Muted category colors
const categoryStyles = {
  feature: { color: 'text-slate-600', bg: 'bg-slate-500', light: 'bg-slate-100' },
  bugfix: { color: 'text-slate-600', bg: 'bg-slate-500', light: 'bg-slate-100' },
  enhancement: { color: 'text-slate-500', bg: 'bg-slate-400', light: 'bg-slate-100' },
  maintenance: { color: 'text-slate-500', bg: 'bg-slate-400', light: 'bg-slate-100' },
};

// Muted status styles for work orders
const statusStyles = {
  requested: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Requested' },
  quoted: { color: 'text-sky-600', bg: 'bg-sky-50', label: 'Quoted' },
  approved: { color: 'text-slate-600', bg: 'bg-slate-100', label: 'Approved' },
  in_progress: { color: 'text-slate-600', bg: 'bg-slate-100', label: 'In Progress' },
  completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  cancelled: { color: 'text-slate-400', bg: 'bg-slate-50', label: 'Cancelled' },
};

const priorityStyles = {
  low: { color: 'text-slate-400', label: 'Low' },
  normal: { color: 'text-slate-500', label: 'Normal' },
  high: { color: 'text-orange-500', label: 'High' },
  urgent: { color: 'text-slate-700', label: 'Urgent' },
};

// Detailed breakdown data - plain English for Stephen
const platformModules = [
  { name: 'Public Website', detail: 'Homepage, About, Programs, Locations, FAQ, Contact pages', value: 8700 },
  { name: 'Online Enrollment', detail: 'Digital waivers with e-signatures parents can sign online', value: 7600 },
  { name: 'Parent Accounts', detail: 'Parents can log in, see their kids, watch videos', value: 9300 },
  { name: 'Admin Dashboard', detail: 'Where you manage students, parents, and everything', value: 17000 },
  { name: 'Payment System', detail: 'Stripe payments - parents pay you directly, auto-receipts', value: 11300 },
  { name: 'Student Tracking', detail: 'Belt ranks, stripes, attendance, progress tracking', value: 5000 },
  { name: 'Video Library', detail: 'Upload curriculum videos for parents to watch at home', value: 4500 },
  { name: 'Community Forums', detail: 'Discussion boards for each location with PIN access', value: 5500 },
  { name: 'Announcements', detail: 'Post updates, student of the month, schedule changes', value: 3500 },
  { name: 'Email Notifications', detail: 'Auto emails for signups, payments, reminders', value: 4900 },
  { name: 'Revenue Dashboard', detail: 'See your monthly revenue, subscriptions, growth', value: 6000 },
  { name: 'Multi-Location Support', detail: 'Manage all your daycare locations in one place', value: 4500 },
  { name: 'Mobile Friendly', detail: 'Works great on phones, tablets, and computers', value: 5000 },
  { name: 'Security', detail: 'Password protection, secure payments, data safety', value: 7600 },
  { name: 'Site Controls', detail: 'Kill switch, payment reminders, maintenance mode', value: 5900 },
  { name: 'Developer Tools', detail: 'This page - submit requests, pay invoices', value: 6400 },
  { name: 'Hosting Setup', detail: 'Domain, SSL certificate, fast servers worldwide', value: 2400 },
  { name: 'Google Search', detail: 'SEO so parents can find you on Google', value: 4300 },
];

function ValuationDialogContent({ totalPaid }: { totalPaid: number }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'breakdown'>('summary');
  const totalValue = platformModules.reduce((sum, m) => sum + m.value, 0);
  const saved = totalValue - totalPaid;

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
                ${saved.toLocaleString()} saved
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
                <p className="text-[32px] font-semibold text-[#1F2A44]">${totalPaid.toLocaleString()}</p>
                <p className="text-[13px] text-slate-500 mt-1">You paid</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-[#F7F9F9] border-t border-[#1F2A44]/5 text-center">
            <p className="text-[13px] text-[#1F2A44]/50">18 features · ${BILLING_CONFIG.monthlyHosting.amount}/mo hosting</p>
            <p className="text-[11px] text-[#1F2A44]/30 mt-2">
              Don&apos;t believe it? Google &quot;website development cost&quot; and see for yourself.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Breakdown View */}
          <div className="pt-4 pb-2 px-8">
            <DialogHeader>
              <DialogTitle className="text-[18px] font-semibold text-[#1F2A44] tracking-tight">
                What This Would Cost Elsewhere
              </DialogTitle>
            </DialogHeader>
            <p className="text-[13px] text-[#1F2A44]/40">Google any of these features to see real agency prices</p>
          </div>
          
          <div className="px-8 py-3 max-h-[40vh] overflow-y-auto">
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-[#1F2A44]">Total Value</span>
              <span className="text-[16px] font-semibold text-[#1F2A44]">${totalValue.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-[#1F2A44]/40 text-center leading-relaxed">
              These are real market rates. Search &quot;custom web app development cost&quot; or 
              &quot;Stripe integration cost&quot; on Google to verify. You got this for free.
            </p>
          </div>
        </>
      )}
    </DialogContent>
  );
}

// Thank You Banner - Shows after recent payment
function ThankYouBanner({ 
  amount, 
  description,
  date 
}: { 
  amount: number;
  description: string;
  date: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
      {/* Animated background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '20px 20px',
        }}
      />
      
      <div className="relative px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Thank you for your payment!</p>
            <p className="text-white/80 text-sm">
              {formatBillingCurrency(amount)} received on {formattedDate} for {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Past Due Banner - Shows when there are overdue items with clear breakdown
function PastDueBanner({ 
  pastDueTotal, 
  pastDueItems,
  onPayNow 
}: { 
  pastDueTotal: number;
  pastDueItems: Array<{ description: string; amount: number }>;
  onPayNow: () => void;
}) {
  if (pastDueTotal <= 0) return null;

  return (
    <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500">
      {/* Animated background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '20px 20px',
        }}
      />
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Past Due: {formatBillingCurrency(pastDueTotal)}</p>
              <div className="text-white/80 text-sm flex flex-wrap gap-x-3 gap-y-1">
                {pastDueItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span>{item.description}</span>
                    <span className="text-white/60">({formatBillingCurrency(item.amount)})</span>
                    {i < pastDueItems.length - 1 && <span className="text-white/40">+</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onPayNow}
            className="px-6 py-2.5 rounded-xl bg-white text-red-600 text-sm font-bold hover:bg-white/90 shadow-lg transition-all whitespace-nowrap"
          >
            Pay {formatBillingCurrency(pastDueTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Holographic Payment Countdown Banner - Only shows when nothing is overdue
function PaymentCountdown({ hasOverdue = false }: { hasOverdue?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getDate();
      
      // Get the 1st of the next month
      let targetDate: Date;
      if (currentDay >= 1) {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      } else {
        targetDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsOverdue(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsOverdue(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't show countdown if there are overdue items - Past Due banner takes priority
  if (hasOverdue) return null;

  const getUrgencyLevel = () => {
    if (isOverdue) return 'critical';
    if (timeLeft.days <= 3) return 'urgent';
    if (timeLeft.days <= 7) return 'warning';
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  // Format the countdown string
  const countdownStr = `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;

  // Get message based on urgency
  const getMessage = () => {
    if (isOverdue) {
      return { main: 'Payment overdue', sub: 'Service suspension pending. Please resolve immediately.' };
    }
    if (urgency === 'urgent') {
      return { main: `${timeLeft.days} days until service pause`, sub: 'Payment required to maintain access.' };
    }
    if (urgency === 'warning') {
      return { main: `Payment due in ${timeLeft.days} days`, sub: 'Services will pause if unpaid.' };
    }
    return { main: `Next payment in ${timeLeft.days} days`, sub: 'Billed on the 1st of each month.' };
  };

  const message = getMessage();

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl">
      {/* Holographic gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: urgency === 'critical' 
            ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.2) 25%, rgba(239,68,68,0.15) 50%, rgba(251,146,60,0.1) 75%, rgba(139,92,246,0.15) 100%)'
            : urgency === 'urgent'
            ? 'linear-gradient(135deg, rgba(251,146,60,0.15) 0%, rgba(245,158,11,0.2) 25%, rgba(236,72,153,0.15) 50%, rgba(139,92,246,0.1) 75%, rgba(251,146,60,0.15) 100%)'
            : 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.15) 25%, rgba(236,72,153,0.1) 50%, rgba(6,182,212,0.15) 75%, rgba(139,92,246,0.1) 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographicShift 12s ease-in-out infinite',
        }}
      />

      {/* Soft glow orbs */}
      <div 
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-40 blur-3xl"
        style={{
          background: urgency === 'critical' 
            ? 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{
          background: urgency === 'critical'
            ? 'radial-gradient(circle, rgba(251,146,60,0.6) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)',
        }}
      />

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl" />

      {/* Top edge highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 80%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative px-6 py-4 flex items-center justify-between">
        {/* Left - Icon + Message */}
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            urgency === 'critical' 
              ? 'bg-gradient-to-br from-pink-500/20 to-red-500/20' 
              : urgency === 'urgent'
              ? 'bg-gradient-to-br from-orange-500/20 to-pink-500/20'
              : 'bg-gradient-to-br from-violet-500/20 to-cyan-500/20'
          }`}>
            {urgency === 'critical' || urgency === 'urgent' ? (
              <AlertCircle className={`h-5 w-5 ${urgency === 'critical' ? 'text-pink-600' : 'text-orange-500'}`} />
            ) : (
              <Calendar className="h-5 w-5 text-violet-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className={`text-[15px] font-semibold ${
                urgency === 'critical' ? 'text-pink-700' : urgency === 'urgent' ? 'text-orange-700' : 'text-gray-800'
              }`}>
                {message.main}
              </p>
              <span className="text-gray-300">|</span>
              <p className="text-[13px] text-gray-500">{message.sub}</p>
            </div>
          </div>
        </div>

        {/* Right - CTA only */}
        <button
          onClick={() => document.getElementById('subscribe-section')?.scrollIntoView({ behavior: 'smooth' })}
          className={`group flex items-center gap-1.5 text-[13px] font-semibold transition-all ${
            urgency === 'critical' 
              ? 'text-pink-600 hover:text-pink-700' 
              : urgency === 'urgent'
              ? 'text-orange-600 hover:text-orange-700'
              : 'text-violet-600 hover:text-violet-700'
          }`}
        >
          <span>Pay now</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes holographicShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

function DeveloperBillingContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const actuallyIsDev = DEV_EMAILS.includes(userEmail || '');
  const isClient = CLIENT_EMAILS.includes(userEmail || '');
  const isAuthorized = actuallyIsDev || isClient;
  
  // View as Stephen toggle (developer only)
  const [viewAsClient, setViewAsClient] = useState(false);
  const isDev = actuallyIsDev && !viewAsClient;
  
  // Work orders state
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [comments, setComments] = useState<WorkOrderComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workOrdersExpanded, setWorkOrdersExpanded] = useState(false); // Collapsed by default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    priority: 'normal' as WorkOrder['priority'],
    category: 'feature' as WorkOrder['category'],
    quoted_cost: '',
    markCompleted: true,
  });
  
  // Quote form state (developer only)
  const [quoteForm, setQuoteForm] = useState({
    quoted_cost: '',
    quoted_hours: '',
    developer_notes: '',
  });
  
  // Edit mode state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    quoted_cost: '',
    status: '' as WorkOrder['status'],
  });
  
  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // Payment state
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
  const [historyTotals, setHistoryTotals] = useState({ all: 450, subscription: 0, oneTime: 450 });

  // Billing summary state - tracks overdue items, due now, upcoming
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  
  // Recent payment - Stephen paid $60 maintenance on Feb 1, 2026
  const [recentPayment] = useState({
    amount: 60,
    date: '2026-02-01',
    description: 'Jan + Feb 2026 Maintenance',
  });
  
  // No overdue maintenance - Stephen paid the $60
  // Work orders ($550) have 5-day grace period ending Feb 6, 2026
  const [overdueItems] = useState<Array<{
    id: string;
    type: 'subscription' | 'maintenance' | 'work_order' | 'invoice';
    description: string;
    amount: number;
    due_date: string;
  }>>([]);

  // Balance reminder state
  const [balanceReminderSettings, setBalanceReminderSettings] = useState<{
    balance_reminder_enabled: boolean;
    reminder_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    payment_expiration_date: string | null;
    last_reminder_sent_at: string | null;
    next_reminder_scheduled_at: string | null;
    client_email: string;
    client_name: string;
  }>({
    balance_reminder_enabled: false,
    reminder_frequency: 'weekly',
    payment_expiration_date: null,
    last_reminder_sent_at: null,
    next_reminder_scheduled_at: null,
    client_email: 'info@littlegrapplers.net',
    client_name: 'Little Grapplers',
  });
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [savingReminderSettings, setSavingReminderSettings] = useState(false);

  // Email activity state
  const [emailActivityEmail, setEmailActivityEmail] = useState('dangzr1@gmail.com');
  const [emailActivity, setEmailActivity] = useState<{
    summary: {
      total_sent: number;
      total_delivered: number;
      total_opened: number;
      total_clicked: number;
      total_bounced: number;
      first_email_at: string | null;
      last_email_at: string | null;
      last_opened_at: string | null;
      open_rate: number;
    };
    activity: Array<{
      id: string;
      type: 'event' | 'reminder';
      event_type: string;
      timestamp: string;
      email_provider_id?: string;
      user_agent?: string;
      ip_address?: string;
      link_url?: string;
      bounce_type?: string;
      bounce_message?: string;
      amount_due?: number;
      reminder_type?: string;
      status?: string;
    }>;
  } | null>(null);
  const [loadingEmailActivity, setLoadingEmailActivity] = useState(false);
  const [showEmailActivity, setShowEmailActivity] = useState(false);

  // Compute billing summary when work orders or subscription changes
  useEffect(() => {
    const summary = getBillingSummary(
      workOrders,
      subscription ? {
        active: subscription.status === 'active',
        amount: subscription.amount || BILLING_CONFIG.monthlyHosting.amount,
        currentPeriodEnd: subscription.currentPeriodEnd,
        status: subscription.status,
      } : null,
      overdueItems
    );
    setBillingSummary(summary);
  }, [workOrders, subscription, overdueItems]);

  // Fetch work orders
  const fetchWorkOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/work-orders');
      if (res.ok) {
        const data = await res.json();
        setWorkOrders(data.workOrders || []);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch comments for selected order
  const fetchComments = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/work-orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  useEffect(() => {
    if (selectedOrder) {
      fetchComments(selectedOrder.id);
    }
  }, [selectedOrder, fetchComments]);

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
          // Add $450 baseline platform cost Stephen paid
          const apiTotals = historyData.totals || { all: 0, subscription: 0, oneTime: 0 };
          setHistoryTotals({
            all: apiTotals.all + 450,
            subscription: apiTotals.subscription,
            oneTime: apiTotals.oneTime + 450,
          });
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
      window.history.replaceState({}, '', '/dashboard/admin/developer');
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    }
    
    if (subscriptionStatus === 'success' && sessionId) {
      setShowSubscriptionSuccess(true);
      fetch('/api/payments/developer/subscription')
        .then(res => res.json())
        .then(data => setSubscription(data.subscription))
        .catch(console.error);
      window.history.replaceState({}, '', '/dashboard/admin/developer');
      setTimeout(() => setShowSubscriptionSuccess(false), 5000);
    }
  }, [searchParams]);

  // Fetch balance reminder settings (developer only)
  useEffect(() => {
    if (!isDev) return;
    
    const fetchReminderSettings = async () => {
      try {
        const res = await fetch('/api/admin/balance-reminder');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setBalanceReminderSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error fetching reminder settings:', error);
      }
    };
    
    fetchReminderSettings();
  }, [isDev]);

  // Fetch email activity
  const fetchEmailActivity = useCallback(async (email: string) => {
    if (!email) return;
    setLoadingEmailActivity(true);
    try {
      const res = await fetch(`/api/admin/email-activity?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setEmailActivity(data);
      }
    } catch (error) {
      console.error('Error fetching email activity:', error);
    } finally {
      setLoadingEmailActivity(false);
    }
  }, []);

  useEffect(() => {
    if (isDev && showEmailActivity && emailActivityEmail) {
      fetchEmailActivity(emailActivityEmail);
    }
  }, [isDev, showEmailActivity, emailActivityEmail, fetchEmailActivity]);

  // Send balance reminder
  const handleSendReminder = async () => {
    setSendingReminder(true);
    setReminderSuccess(false);
    try {
      const res = await fetch('/api/admin/balance-reminder/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderType: 'manual' }),
      });
      
      if (res.ok) {
        setReminderSuccess(true);
        // Refresh settings to get updated last_reminder_sent_at
        const settingsRes = await fetch('/api/admin/balance-reminder');
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings) {
            setBalanceReminderSettings(data.settings);
          }
        }
        setTimeout(() => setReminderSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  // Update balance reminder settings
  const handleUpdateReminderSettings = async (updates: Partial<typeof balanceReminderSettings>) => {
    setSavingReminderSettings(true);
    try {
      const res = await fetch('/api/admin/balance-reminder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setBalanceReminderSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('Error updating reminder settings:', error);
    } finally {
      setSavingReminderSettings(false);
    }
  };

  // Submit new work order request
  const handleSubmitRequest = async () => {
    if (!requestForm.title.trim()) return;
    if (isDev && !requestForm.quoted_cost) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: requestForm.title,
        description: requestForm.description || requestForm.title,
        priority: requestForm.priority,
        category: requestForm.category,
        // Developer can set cost and status directly
        ...(isDev && {
          quoted_cost: parseFloat(requestForm.quoted_cost) || 0,
          status: requestForm.markCompleted ? 'completed' : 'quoted',
        }),
      };
      
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setRequestForm({ title: '', description: '', priority: 'normal', category: 'feature', quoted_cost: '', markCompleted: true });
        setShowRequestForm(false);
        fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit quote (developer only)
  const handleSubmitQuote = async (orderId: string) => {
    if (!quoteForm.quoted_cost) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoted_cost: parseFloat(quoteForm.quoted_cost),
          quoted_hours: quoteForm.quoted_hours ? parseFloat(quoteForm.quoted_hours) : null,
          developer_notes: quoteForm.developer_notes || null,
          status: 'quoted',
        }),
      });
      
      if (res.ok) {
        setQuoteForm({ quoted_cost: '', quoted_hours: '', developer_notes: '' });
        fetchWorkOrders();
        if (selectedOrder?.id === orderId) {
          const data = await res.json();
          setSelectedOrder(data.workOrder);
        }
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, status: WorkOrder['status']) => {
    try {
      const res = await fetch(`/api/work-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        fetchWorkOrders();
        if (selectedOrder?.id === orderId) {
          const data = await res.json();
          setSelectedOrder(data.workOrder);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!selectedOrder || !newComment.trim()) return;
    
    try {
      const res = await fetch(`/api/work-orders/${selectedOrder.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (res.ok) {
        setNewComment('');
        fetchComments(selectedOrder.id);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Edit comment
  const handleEditComment = async (workOrderId: string, commentId: string) => {
    if (!editCommentContent.trim()) return;
    
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content: editCommentContent }),
      });
      
      if (res.ok) {
        setEditingCommentId(null);
        setEditCommentContent('');
        fetchComments(workOrderId);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (workOrderId: string, commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchComments(workOrderId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Delete work order (developer only)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Delete this work order?')) return;
    
    try {
      const res = await fetch(`/api/work-orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedOrder(null);
        fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Start editing a work order
  const handleStartEdit = (order: WorkOrder) => {
    setEditingOrderId(order.id);
    setEditForm({
      title: order.title,
      description: order.description,
      quoted_cost: order.quoted_cost?.toString() || '',
      status: order.status,
    });
  };

  // Save edited work order
  const handleSaveEdit = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          quoted_cost: parseFloat(editForm.quoted_cost) || null,
          status: editForm.status,
        }),
      });
      
      if (res.ok) {
        setEditingOrderId(null);
        fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error saving edit:', error);
    } finally {
      setIsSubmitting(false);
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

  // Calculate totals from work orders
  const unpaidOrders = workOrders.filter(o => o.status === 'completed' && !o.paid);
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + (o.quoted_cost || 0), 0);
  const pendingOrders = workOrders.filter(o => !['completed', 'cancelled'].includes(o.status));

  // Calculate total due now (overdue + work orders)
  const totalDueNow = (billingSummary?.totals.due_now || 0);

  // Pay all unpaid work orders
  const [processingPayAll, setProcessingPayAll] = useState(false);
  
  // Pay ONLY past due items (maintenance fee) - separate from work orders
  const handlePayPastDue = async () => {
    const pastDueTotal = billingSummary?.totals.past_due || 0;
    if (pastDueTotal <= 0) return;
    
    setProcessingPayAll(true);
    try {
      const descriptions = billingSummary?.pastDueItems.map(item => item.description) || [];
      
      const response = await fetch('/api/payments/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pastDueTotal,
          description: descriptions.join(', '),
          workOrderIds: [], // No work orders - just past due items
          includeOverdue: true,
          overdueItems: billingSummary?.pastDueItems.map(item => ({
            id: item.id,
            type: item.type,
            amount: item.amount,
          })),
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
      setProcessingPayAll(false);
    }
  };
  
  // Legacy: Pay only work orders (kept for backwards compatibility)
  const handlePayAll = async () => {
    if (unpaidTotal <= 0) return;
    
    setProcessingPayAll(true);
    try {
      const description = unpaidOrders.map(o => o.title).join(', ');
      const response = await fetch('/api/payments/developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: unpaidTotal,
          description: `Development work: ${description}`,
          workOrderIds: unpaidOrders.map(o => o.id),
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
      setProcessingPayAll(false);
    }
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
        <p className="text-gray-500">This page is only available to authorized users.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Work Orders' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Work Orders</h1>
          <p className="text-gray-500 mt-1">
            {isDev ? 'Manage requests and billing' : 'Submit feature requests and ideas'}
          </p>
        </div>
        {!showRequestForm && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isDev ? 'Add Work Order' : 'Submit Request'}
          </button>
        )}
      </div>

      {/* Thank You Banner - Shows after recent payment */}
      {recentPayment && (
        <ThankYouBanner
          amount={recentPayment.amount}
          description={recentPayment.description}
          date={recentPayment.date}
        />
      )}

      {/* Past Due Banner - Shows first if there are overdue items */}
      {billingSummary && billingSummary.hasOverdue && (
        <PastDueBanner
          pastDueTotal={billingSummary.totals.past_due}
          pastDueItems={billingSummary.pastDueItems.map(item => ({
            description: item.description,
            amount: item.amount,
          }))}
          onPayNow={handlePayPastDue}
        />
      )}

      {/* Payment Due Countdown - Only shows when nothing is overdue */}
      <PaymentCountdown hasOverdue={billingSummary?.hasOverdue || false} />

      {/* View as Stephen Toggle - Developer Only */}
      {actuallyIsDev && (
        <div className="mb-6">
          <button
            onClick={() => setViewAsClient(!viewAsClient)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              viewAsClient
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserCircle className="h-4 w-4" />
            {viewAsClient ? 'Viewing as Stephen' : 'View as Stephen'}
            <span className={`ml-1 w-8 h-5 rounded-full relative transition-colors ${viewAsClient ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${viewAsClient ? 'left-3.5' : 'left-0.5'}`} />
            </span>
          </button>
        </div>
      )}

      {/* Success Messages */}
      {showPaymentSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-gray-900">Payment successful! Thank you.</p>
        </div>
      )}
      {showSubscriptionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-gray-900">Subscription activated!</p>
        </div>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">{isDev ? 'New Work Order' : 'Submit a Request'}</h2>
            <button onClick={() => setShowRequestForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={requestForm.title}
                onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                placeholder="What do you need?"
                className="rounded-xl border-gray-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Describe what you're looking for in detail..."
                rows={4}
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value as WorkOrder['category'] })}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="feature">Feature</option>
                  <option value="bugfix">Bug Fix</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {isDev && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($) *</label>
                  <Input
                    type="number"
                    value={requestForm.quoted_cost}
                    onChange={(e) => setRequestForm({ ...requestForm, quoted_cost: e.target.value })}
                    placeholder="50"
                    className="rounded-xl border-gray-200"
                  />
                </div>
              )}
            </div>
            
            {isDev && (
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="markCompleted"
                  checked={requestForm.markCompleted}
                  onChange={(e) => setRequestForm({ ...requestForm, markCompleted: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="markCompleted" className="text-sm text-gray-700">
                  Ready for payment (mark as completed)
                </label>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setShowRequestForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600">
              Cancel
            </button>
            <button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !requestForm.title.trim() || (isDev && !requestForm.quoted_cost)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDev ? 'Create Invoice' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Welcome Card - Client View */}
      {!isDev && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Website is Live</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600">ONLINE</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-4">
            Everything is set up and running. Need changes or new features? Submit a request below.
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Monthly hosting fee</p>
            <p className="text-lg font-bold text-gray-900">${BILLING_CONFIG.monthlyHosting.amount}<span className="text-sm font-normal text-gray-500">/mo</span></p>
          </div>
        </div>
      )}

      {/* Monthly Hosting Banner */}
      <div id="subscribe-section" className="relative mb-6 bg-gradient-to-br from-white via-sky-50/80 to-indigo-50/50 rounded-2xl shadow-sm border border-sky-100/60 overflow-hidden">
        {/* Floating glass elements - more visible */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-sky-300/40 via-cyan-200/30 to-transparent blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-300/35 via-purple-200/25 to-transparent blur-2xl"
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-sky-200/20 blur-xl"
            animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
        
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center shadow-sm">
                <RefreshCw className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Monthly Hosting</p>
                <p className="text-sm text-slate-500">${BILLING_CONFIG.monthlyHosting.amount}/mo · Supabase + Vercel infrastructure</p>
              </div>
            </div>
            {subscription ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/80 backdrop-blur-sm border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">Active</span>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={processingSubscription}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-900/20"
              >
                {processingSubscription ? 'Processing...' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
        <div className="relative px-4 py-3 bg-slate-50/50 border-t border-slate-100/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Billed on the <span className="font-medium text-slate-700">1st of each month</span>. Services will be paused if payment is not received.</span>
          </div>
        </div>
      </div>

      {/* Unpaid Work Orders - Payment Card */}
      {unpaidTotal > 0 && (
        <div className="mb-6 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 rounded-2xl shadow-lg shadow-slate-500/20 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg">Development Services</p>
                <p className="text-white/70 text-sm">{unpaidOrders.length} completed {unpaidOrders.length === 1 ? 'task' : 'tasks'} ready for payment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatCurrency(unpaidTotal)}</p>
              <button
                onClick={handlePayAll}
                disabled={processingPayAll}
                className="mt-2 px-5 py-2 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {processingPayAll ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
          {/* List unpaid tasks */}
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            {unpaidOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{order.title}</span>
                <span className="font-medium">{formatCurrency(order.quoted_cost || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance Reminder Controls - Developer Only */}
      {isDev && unpaidTotal > 0 && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Mail className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Balance Reminders</h2>
                <p className="text-sm text-gray-500">Send payment reminders to client</p>
              </div>
            </div>
            <button
              onClick={() => setShowReminderSettings(!showReminderSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          {/* Reminder Success Message */}
          {reminderSuccess && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-700">Reminder sent successfully!</span>
            </div>
          )}

          {/* Settings Panel */}
          {showReminderSettings && (
            <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-4">
              {/* Auto-reminder toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Automated Reminders</p>
                    <p className="text-xs text-gray-500">Send reminders on a schedule</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateReminderSettings({ 
                    balance_reminder_enabled: !balanceReminderSettings.balance_reminder_enabled 
                  })}
                  disabled={savingReminderSettings}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    balanceReminderSettings.balance_reminder_enabled ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    balanceReminderSettings.balance_reminder_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Frequency selector */}
              {balanceReminderSettings.balance_reminder_enabled && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">Frequency</p>
                  </div>
                  <select
                    value={balanceReminderSettings.reminder_frequency}
                    onChange={(e) => handleUpdateReminderSettings({ 
                      reminder_frequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly'
                    })}
                    disabled={savingReminderSettings}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              {/* Expiration date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Deadline</p>
                    <p className="text-xs text-gray-500">Auto-disable site after this date</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={balanceReminderSettings.payment_expiration_date || ''}
                  onChange={(e) => handleUpdateReminderSettings({ 
                    payment_expiration_date: e.target.value || null 
                  })}
                  disabled={savingReminderSettings}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                />
              </div>

              {/* Last reminder info */}
              {balanceReminderSettings.last_reminder_sent_at && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last reminder sent: {new Date(balanceReminderSettings.last_reminder_sent_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Send Reminder Button */}
          <div className="p-5">
            <button
              onClick={handleSendReminder}
              disabled={sendingReminder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all"
            >
              {sendingReminder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sendingReminder ? 'Sending...' : 'Send Balance Reminder'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Sends a branded email to {balanceReminderSettings.client_email}
            </p>
          </div>
        </div>
      )}

      {/* Email Activity Tracker - Developer Only */}
      {isDev && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowEmailActivity(!showEmailActivity)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-900">Email Activity Tracker</h2>
                <p className="text-sm text-gray-500">View opens, clicks, and engagement</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showEmailActivity ? 'rotate-180' : ''}`} />
          </button>

          {showEmailActivity && (
            <div className="border-t border-gray-100">
              {/* Search */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={emailActivityEmail}
                      onChange={(e) => setEmailActivityEmail(e.target.value)}
                      placeholder="Enter email address..."
                      className="pl-9 rounded-xl border-gray-200"
                      onKeyDown={(e) => e.key === 'Enter' && fetchEmailActivity(emailActivityEmail)}
                    />
                  </div>
                  <button
                    onClick={() => fetchEmailActivity(emailActivityEmail)}
                    disabled={loadingEmailActivity || !emailActivityEmail}
                    className="px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
                  >
                    {loadingEmailActivity ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>

              {loadingEmailActivity ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" />
                </div>
              ) : emailActivity ? (
                <>
                  {/* Summary Stats */}
                  <div className="p-4 grid grid-cols-5 gap-3">
                    <div className="text-center p-3 rounded-xl bg-blue-50">
                      <p className="text-2xl font-bold text-blue-600">{emailActivity.summary.total_sent}</p>
                      <p className="text-xs text-blue-600/70 font-medium">Sent</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-emerald-50">
                      <p className="text-2xl font-bold text-emerald-600">{emailActivity.summary.total_delivered}</p>
                      <p className="text-xs text-emerald-600/70 font-medium">Delivered</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-purple-50">
                      <p className="text-2xl font-bold text-purple-600">{emailActivity.summary.total_opened}</p>
                      <p className="text-xs text-purple-600/70 font-medium">Opened</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-orange-50">
                      <p className="text-2xl font-bold text-orange-600">{emailActivity.summary.total_clicked}</p>
                      <p className="text-xs text-orange-600/70 font-medium">Clicked</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gray-100">
                      <p className="text-2xl font-bold text-gray-600">{emailActivity.summary.open_rate}%</p>
                      <p className="text-xs text-gray-500 font-medium">Open Rate</p>
                    </div>
                  </div>

                  {/* Last Opened */}
                  {emailActivity.summary.last_opened_at && (
                    <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700">Last opened:</span>
                        <span className="text-sm text-purple-600">
                          {new Date(emailActivity.summary.last_opened_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Activity Timeline */}
                  {emailActivity.activity.length > 0 ? (
                    <div className="border-t border-gray-100">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Activity Timeline</p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                        {emailActivity.activity.map((event) => {
                          const eventIcons: Record<string, { icon: typeof Eye; color: string; bg: string }> = {
                            sent: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50' },
                            delivered: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            opened: { icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50' },
                            clicked: { icon: MousePointer, color: 'text-orange-500', bg: 'bg-orange-50' },
                            bounced: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                            reminder_sent: { icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
                          };
                          const eventStyle = eventIcons[event.event_type] || { icon: Mail, color: 'text-gray-500', bg: 'bg-gray-50' };
                          const IconComponent = eventStyle.icon;

                          return (
                            <div key={event.id} className="px-4 py-3 flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-lg ${eventStyle.bg} flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className={`h-4 w-4 ${eventStyle.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {event.event_type.replace('_', ' ')}
                                  </span>
                                  {event.amount_due && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                      {formatCurrency(event.amount_due)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(event.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                                {event.link_url && (
                                  <p className="text-xs text-blue-500 truncate mt-1">{event.link_url}</p>
                                )}
                                {event.bounce_message && (
                                  <p className="text-xs text-red-500 mt-1">{event.bounce_message}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center border-t border-gray-100">
                      <Mail className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No email activity found for this address</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Enter an email address to view activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Work Orders List - Collapsible */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <button
          onClick={() => setWorkOrdersExpanded(!workOrdersExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="text-left">
            <h2 className="font-semibold text-gray-900">Work Orders</h2>
            <p className="text-sm text-gray-500">{pendingOrders.length} pending · {workOrders.filter(o => o.status === 'completed').length} completed</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${workOrdersExpanded ? 'rotate-180' : ''}`} />
        </button>

        {workOrdersExpanded && isLoading && (
          <div className="p-8 text-center border-t border-gray-100">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" />
          </div>
        )}
        
        {workOrdersExpanded && !isLoading && workOrders.length === 0 && (
          <div className="p-8 text-center border-t border-gray-100">
            <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No work orders yet</p>
          </div>
        )}
        
        {workOrdersExpanded && !isLoading && workOrders.length > 0 && (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {workOrders.map((order) => {
              const catStyle = categoryStyles[order.category];
              const statStyle = statusStyles[order.status];
              const isSelected = selectedOrder?.id === order.id;
              
              return (
                <div key={order.id}>
                  <div
                    className={`px-5 py-4 cursor-pointer transition-colors ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${catStyle.light} ${catStyle.color}`}>
                            {order.category}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${statStyle.bg} ${statStyle.color}`}>
                            {statStyle.label}
                          </span>
                          {order.priority !== 'normal' && (
                            <span className={`text-[10px] font-medium ${priorityStyles[order.priority].color}`}>
                              {priorityStyles[order.priority].label}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{order.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{order.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested by {order.requested_by.split('@')[0]} · {formatRelativeTime(order.created_at)}
                        </p>
                      </div>
                      {order.quoted_cost && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.quoted_cost)}</p>
                          {order.quoted_hours && (
                            <p className="text-xs text-gray-400">{order.quoted_hours} hrs</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                      {/* Developer Notes */}
                      {order.developer_notes && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Developer Notes</p>
                          <p className="text-sm text-blue-800">{order.developer_notes}</p>
                        </div>
                      )}

                      {/* Quote Form (Developer Only) */}
                      {isDev && order.status === 'requested' && (
                        <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 mb-3">Provide Quote</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Cost ($)</label>
                              <Input
                                type="number"
                                value={quoteForm.quoted_cost}
                                onChange={(e) => setQuoteForm({ ...quoteForm, quoted_cost: e.target.value })}
                                placeholder="100"
                                className="rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Hours</label>
                              <Input
                                type="number"
                                step="0.5"
                                value={quoteForm.quoted_hours}
                                onChange={(e) => setQuoteForm({ ...quoteForm, quoted_hours: e.target.value })}
                                placeholder="2"
                                className="rounded-lg"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => handleSubmitQuote(order.id)}
                                disabled={isSubmitting || !quoteForm.quoted_cost}
                                className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                              >
                                Send Quote
                              </button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Textarea
                              value={quoteForm.developer_notes}
                              onChange={(e) => setQuoteForm({ ...quoteForm, developer_notes: e.target.value })}
                              placeholder="Add notes about the work..."
                              rows={2}
                              className="rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Developer Edit Form */}
                      {isDev && editingOrderId === order.id ? (
                        <div className="mt-4 p-4 rounded-xl bg-white border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 mb-3">Edit Work Order</p>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Title</label>
                              <Input
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
                                <Input
                                  type="number"
                                  value={editForm.quoted_cost}
                                  onChange={(e) => setEditForm({ ...editForm, quoted_cost: e.target.value })}
                                  placeholder="0"
                                  className="rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Status</label>
                                <select
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as WorkOrder['status'] })}
                                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm"
                                >
                                  <option value="requested">Requested</option>
                                  <option value="quoted">Quoted</option>
                                  <option value="approved">Approved</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Description</label>
                              <Textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows={2}
                                className="rounded-lg text-sm"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSaveEdit(order.id)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                              >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={() => setEditingOrderId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : isDev && (
                        <button
                          onClick={() => handleStartEdit(order)}
                          className="mt-4 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          Edit Work Order
                        </button>
                      )}

                      {/* Status Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {/* Client can approve quoted orders */}
                        {!isDev && order.status === 'quoted' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
                          >
                            Approve Quote
                          </button>
                        )}
                        
                        {/* Developer status controls */}
                        {isDev && (
                          <>
                            {order.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-600"
                              >
                                Start Work
                              </button>
                            )}
                            {order.status === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
                              >
                                Mark Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {/* Cancel (if not completed) */}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {/* Comments */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          <MessageCircle className="h-3 w-3 inline mr-1" />
                          Discussion
                        </p>
                        
                        {comments.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {comments.map((comment) => {
                              const isOwnComment = comment.author_email === userEmail;
                              const canModify = isOwnComment || isDev;
                              const isEditing = editingCommentId === comment.id;
                              
                              return (
                                <div key={comment.id} className="p-3 rounded-lg bg-white border border-gray-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {comment.author_email.split('@')[0]}
                                      </span>
                                      <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                                    </div>
                                    {canModify && !isEditing && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditCommentContent(comment.content);
                                          }}
                                          className="p-1 text-gray-400 hover:text-blue-500"
                                          title="Edit"
                                        >
                                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(order.id, comment.id)}
                                          className="p-1 text-gray-400 hover:text-red-500"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        rows={2}
                                        className="text-sm rounded-lg"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditComment(order.id, comment.id)}
                                          className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(null);
                                            setEditCommentContent('');
                                          }}
                                          className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600">{comment.content}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-lg text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                          />
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${payment.type === 'subscription' ? 'bg-slate-100' : 'bg-blue-50'}`}>
                  {payment.type === 'subscription' ? <RefreshCw className="h-5 w-5 text-slate-600" /> : <Receipt className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{payment.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Valuation - Only show when Work Orders expanded */}
      {workOrdersExpanded && (
        <div className="pt-6 border-t border-gray-100">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full group">
                <div className="flex items-center justify-center gap-2 py-3 text-sm">
                  <span className="text-gray-400">Platform value saved:</span>
                  <span className="font-medium text-emerald-600">${(platformModules.reduce((sum, m) => sum + m.value, 0) - historyTotals.all).toLocaleString()}</span>
                  <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                </div>
              </button>
            </DialogTrigger>
            <ValuationDialogContent totalPaid={historyTotals.all} />
          </Dialog>
        </div>
      )}

      {/* Footer - Only show when Work Orders expanded */}
      {workOrdersExpanded && (
        <p className="text-center text-xs text-gray-400 mt-4 mb-8">
          {isDev ? 'Developer access' : 'Client access'}
        </p>
      )}
    </div>
  );
}

export default function DeveloperBillingPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto animate-pulse"><div className="h-8 bg-gray-200 rounded w-32 mb-4" /><div className="h-24 bg-gray-100 rounded-2xl" /></div>}>
      <DeveloperBillingContent />
    </Suspense>
  );
}
