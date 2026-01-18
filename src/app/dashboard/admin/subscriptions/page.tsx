'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Calendar, DollarSign, Pause, Play, X, RefreshCw, Clock, CheckCircle, AlertCircle, Ban, Edit3, ChevronDown, ChevronUp, Receipt, ExternalLink, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  childName?: string | null;
  status: string;
  planType: 'recurring' | 'one_time';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  created: string;
  amount: number;
  interval: string;
  metadata: Record<string, string>;
}

interface Payment {
  id: string;
  number: string | null;
  date: string;
  amount: number;
  status: string;
  description: string;
  periodStart: string | null;
  periodEnd: string | null;
  receiptUrl: string | null;
  pdfUrl: string | null;
  refunded: boolean;
  refundAmount: number;
}

interface PaymentSummary {
  totalPaid: number;
  totalRefunded: number;
  netRevenue: number;
  paymentCount: number;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingBillingDate, setEditingBillingDate] = useState<string | null>(null);
  const [newBillingDate, setNewBillingDate] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/subscriptions?status=${statusFilter}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError('Failed to load subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const performAction = async (action: string, subscriptionId: string, params?: Record<string, unknown>) => {
    setActionLoading(subscriptionId);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, subscriptionId, ...params }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }
      
      // Show success message
      const actionLabels: Record<string, string> = {
        'cancel': 'Subscription will cancel at period end',
        'cancel_immediately': 'Subscription canceled immediately',
        'resume': 'Cancellation removed - subscription continues',
        'pause': 'Billing paused',
        'unpause': 'Billing resumed',
        'charge_now': 'Invoice created and charged',
      };
      setSuccessMessage(actionLabels[action] || 'Action completed');
      
      // Refresh subscriptions
      await fetchSubscriptions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateBillingDate = async (subscriptionId: string) => {
    if (!newBillingDate) return;
    await performAction('update_billing_anchor', subscriptionId, { billingCycleAnchor: newBillingDate });
    setEditingBillingDate(null);
    setNewBillingDate('');
  };

  const fetchPaymentHistory = async (customerId: string) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      return;
    }
    
    setExpandedCustomer(customerId);
    setLoadingPayments(true);
    setPaymentHistory([]);
    setPaymentSummary(null);
    
    try {
      const res = await fetch(`/api/admin/subscriptions/${customerId}/payments`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPaymentHistory(data.payments || []);
      setPaymentSummary(data.summary || null);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (sub: Subscription) => {
    // Show plan type badge for one-time payments
    if (sub.planType === 'one_time') {
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-blue-500">3-Month Plan</Badge>
          {sub.status === 'active' && <Badge className="bg-emerald-500">Active</Badge>}
        </div>
      );
    }
    
    if (sub.cancelAtPeriodEnd) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Canceling</Badge>;
    }
    switch (sub.status) {
      case 'active':
        return <Badge className="bg-emerald-500">Active</Badge>;
      case 'past_due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-gray-500">Canceled</Badge>;
      case 'trialing':
        // Show "Billing Deferred" with next charge date instead of confusing "Trial" badge
        return (
          <Badge className="bg-purple-500">
            Billing Deferred → {sub.trialEnd ? formatDate(sub.trialEnd) : 'TBD'}
          </Badge>
        );
      case 'paused':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Paused</Badge>;
      default:
        return <Badge variant="outline">{sub.status}</Badge>;
    }
  };

  const activeCount = subscriptions.filter(s => s.status === 'active' && !s.cancelAtPeriodEnd).length;
  const totalMRR = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-500 mt-1">Manage customer subscriptions, billing dates, and payments</p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="font-medium text-emerald-800">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMRR)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'past_due', 'canceled', 'trialing', 'one_time'].map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All' : status === 'one_time' ? '3-Month Plans' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No subscriptions found</div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map(sub => (
                <div 
                  key={sub.id} 
                  className="border rounded-xl overflow-hidden transition-colors"
                >
                  <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => fetchPaymentHistory(sub.customerId)}
                          className="font-semibold text-gray-900 truncate hover:text-brand transition-colors flex items-center gap-1"
                        >
                          {sub.customerName}
                          {expandedCustomer === sub.customerId ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {getStatusBadge(sub)}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{sub.customerEmail}</p>
                      {sub.childName && (
                        <p className="text-xs text-brand mt-0.5">Child: {sub.childName}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatCurrency(sub.amount)}/{sub.interval}
                        </span>
                        {editingBillingDate === sub.id ? (
                          <span className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <input
                              type="date"
                              value={newBillingDate}
                              onChange={(e) => setNewBillingDate(e.target.value)}
                              className="border rounded px-2 py-0.5 text-xs"
                            />
                            <button
                              onClick={() => handleUpdateBillingDate(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="text-emerald-600 hover:text-emerald-700 font-medium text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingBillingDate(null); setNewBillingDate(''); }}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 group">
                            <Calendar className="h-3.5 w-3.5" />
                            Next: {formatDate(sub.currentPeriodEnd)}
                            <button
                              onClick={() => {
                                setEditingBillingDate(sub.id);
                                setNewBillingDate(sub.currentPeriodEnd ? sub.currentPeriodEnd.split('T')[0] : '');
                              }}
                              className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-600 ml-1"
                              title="Edit billing date"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Since {formatDate(sub.created)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => performAction('pause', sub.id)}
                            disabled={actionLoading === sub.id}
                            className="gap-1"
                          >
                            <Pause className="h-3.5 w-3.5" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Cancel this subscription at end of billing period?')) {
                                performAction('cancel', sub.id);
                              }
                            }}
                            disabled={actionLoading === sub.id}
                            className="gap-1 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {sub.cancelAtPeriodEnd && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => performAction('resume', sub.id)}
                          disabled={actionLoading === sub.id}
                          className="gap-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Resume
                        </Button>
                      )}
                      
                      {sub.status === 'past_due' && (
                        <Button
                          size="sm"
                          onClick={() => performAction('charge_now', sub.id)}
                          disabled={actionLoading === sub.id}
                          className="gap-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Charge Now
                        </Button>
                      )}
                      
                      {sub.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Cancel immediately? Customer will lose access now.')) {
                              performAction('cancel_immediately', sub.id);
                            }
                          }}
                          disabled={actionLoading === sub.id}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  </div>
                  
                  {/* Payment History Expandable Section */}
                  {expandedCustomer === sub.customerId && (
                    <div className="border-t bg-gray-50 p-4">
                      {loadingPayments ? (
                        <div className="text-center py-4 text-gray-500">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Loading payment history...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Payment Summary */}
                          {paymentSummary && (
                            <div className="grid grid-cols-4 gap-4 mb-4">
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500">Total Paid</p>
                                <p className="text-lg font-bold text-emerald-600">{formatCurrency(paymentSummary.totalPaid)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500">Total Refunded</p>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(paymentSummary.totalRefunded)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500">Net Revenue</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(paymentSummary.netRevenue)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500">Payments</p>
                                <p className="text-lg font-bold text-gray-900">{paymentSummary.paymentCount}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Payment List */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                              <Receipt className="h-4 w-4" />
                              Payment History
                            </h4>
                            {paymentHistory.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No payments found</p>
                            ) : (
                              <div className="space-y-2">
                                {paymentHistory.map(payment => (
                                  <div 
                                    key={payment.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border bg-white ${payment.refunded ? 'border-red-200' : ''}`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                          {formatCurrency(payment.amount)}
                                        </span>
                                        {payment.refunded && (
                                          <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Refunded {formatCurrency(payment.refundAmount)}
                                          </Badge>
                                        )}
                                        {payment.status === 'paid' && !payment.refunded && (
                                          <Badge className="bg-emerald-500 text-xs">Paid</Badge>
                                        )}
                                        {payment.status === 'open' && (
                                          <Badge variant="outline" className="text-amber-600 text-xs">Pending</Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(payment.date)} • {payment.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {payment.receiptUrl && (
                                        <a
                                          href={payment.receiptUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Receipt
                                        </a>
                                      )}
                                      {payment.pdfUrl && (
                                        <a
                                          href={payment.pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                                        >
                                          <Receipt className="h-3 w-3" />
                                          Invoice
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
