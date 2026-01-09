'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, X, ChevronDown, Check, Plus, CheckCircle, RefreshCw, Calendar, Receipt, MessageCircle, Clock, AlertCircle, Send, DollarSign, Loader2 } from 'lucide-react';
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

// Apple-inspired category colors
const categoryStyles = {
  feature: { color: 'text-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' },
  bugfix: { color: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50' },
  enhancement: { color: 'text-orange-500', bg: 'bg-orange-500', light: 'bg-orange-50' },
  maintenance: { color: 'text-gray-500', bg: 'bg-gray-500', light: 'bg-gray-50' },
};

// Status styles for work orders
const statusStyles = {
  requested: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Requested' },
  quoted: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Quoted' },
  approved: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Approved' },
  in_progress: { color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'In Progress' },
  completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-50', label: 'Cancelled' },
};

const priorityStyles = {
  low: { color: 'text-gray-500', label: 'Low' },
  normal: { color: 'text-blue-500', label: 'Normal' },
  high: { color: 'text-orange-500', label: 'High' },
  urgent: { color: 'text-red-500', label: 'Urgent' },
};

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

function DeveloperBillingContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const isDev = DEV_EMAILS.includes(userEmail || '');
  const isClient = CLIENT_EMAILS.includes(userEmail || '');
  const isAuthorized = isDev || isClient;
  
  // Work orders state
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [comments, setComments] = useState<WorkOrderComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [historyTotals, setHistoryTotals] = useState({ all: 0, subscription: 0, oneTime: 0 });

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

  // Pay all unpaid work orders
  const [processingPayAll, setProcessingPayAll] = useState(false);
  
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2EC4B6] text-white text-sm font-medium hover:bg-[#2EC4B6]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isDev ? 'Add Work Order' : 'Submit Request'}
          </button>
        )}
      </div>

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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2EC4B6] rounded-xl hover:bg-[#2EC4B6]/90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDev ? 'Create Invoice' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Monthly Hosting Banner */}
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
          {subscription ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">Active</span>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={processingSubscription}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {processingSubscription ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      </div>

      {/* Unpaid Work Orders - Payment Card */}
      {unpaidTotal > 0 && (
        <div className="mb-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500 rounded-2xl shadow-lg shadow-emerald-500/20 p-5 text-white">
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
                className="mt-2 px-5 py-2 rounded-xl bg-white text-emerald-600 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors"
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

      {/* Work Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Work Orders</h2>
            <p className="text-sm text-gray-500">{pendingOrders.length} pending · {workOrders.filter(o => o.status === 'completed').length} completed</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" />
          </div>
        ) : workOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No work orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
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

      {/* Platform Valuation */}
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

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-4 mb-8">
        {isDev ? 'Developer access' : 'Client access'}
      </p>
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
