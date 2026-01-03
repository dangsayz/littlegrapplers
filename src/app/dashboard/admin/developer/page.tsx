'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, X, Info, ChevronDown, CreditCard, Check, Circle, Plus, CheckCircle } from 'lucide-react';
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
const CLIENT_EMAILS = ['info@littlegrapplers.net', 'walkawayy@icloud.com'];

interface WorkEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'bugfix' | 'enhancement' | 'maintenance';
  cost: number;
  justification: string;
  status: 'completed' | 'in-progress' | 'pending';
  paid: boolean;
  paidAt?: string;
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
    description: 'Updated admin authentication to support multiple admin emails. Client now has full admin access.',
    category: 'feature',
    cost: 100,
    justification: 'Security-critical feature requiring auth system modifications, role-based access control, and testing across multiple user sessions.',
    status: 'completed',
    paid: false,
  },
  {
    id: '2',
    date: '2026-01-02',
    title: 'Contact Email Update',
    description: 'Changed all contact email references to info@littlegrapplers.net across contact page, footer, privacy policy, and terms of service.',
    category: 'enhancement',
    cost: 50,
    justification: 'Updates across 4+ pages including legal documents. Requires careful review to ensure no references are missed.',
    status: 'completed',
    paid: false,
  },
  {
    id: '3',
    date: '2026-01-02',
    title: 'Location Selector for Enrollment',
    description: 'Added location selection to the enrollment waiver form with 3 locations and day-of-week scheduling.',
    category: 'feature',
    cost: 100,
    justification: 'New form field with database schema update, dropdown UI component, and integration with existing waiver submission flow.',
    status: 'completed',
    paid: false,
  },
  {
    id: '4',
    date: '2026-01-02',
    title: 'Developer Billing Dashboard',
    description: 'Created this admin page to track development work and billing for full transparency.',
    category: 'feature',
    cost: 100,
    justification: 'Full admin page with work log management, summary statistics, and project valuation report.',
    status: 'completed',
    paid: false,
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
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

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

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      // Only mark as paid if we have a session_id (harder to fake)
      setShowPaymentSuccess(true);
      setWorkEntries(prev => prev.map(entry => 
        !entry.paid ? { ...entry, paid: true, paidAt: new Date().toISOString() } : entry
      ));
      // Clean URL params
      window.history.replaceState({}, '', '/dashboard/admin/developer');
      setTimeout(() => setShowPaymentSuccess(false), 5000);
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

  // Calculate totals
  const totalCost = workEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const unpaidEntries = workEntries.filter(e => !e.paid);
  const paidEntries = workEntries.filter(e => e.paid);
  const unpaidTotal = unpaidEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const paidTotal = paidEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const completedEntries = workEntries.filter(e => e.status === 'completed').length;

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.description) return;
    
    const entry: WorkEntry = {
      id: Date.now().toString(),
      date: newEntry.date || new Date().toISOString().split('T')[0],
      title: newEntry.title || '',
      description: newEntry.description || '',
      category: newEntry.category as WorkEntry['category'] || 'feature',
      cost: newEntry.cost || 50,
      justification: newEntry.justification || '',
      status: newEntry.status as WorkEntry['status'] || 'completed',
      paid: false,
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

      {/* Payment Success Message */}
      {showPaymentSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-gray-900">Payment successful! Thank you.</p>
        </div>
      )}

      {/* Summary Card - Apple Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Outstanding</p>
            <p className="text-3xl font-semibold tracking-tight text-gray-900">{formatCurrency(unpaidTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">{unpaidEntries.length} unpaid tasks</p>
            {paidTotal > 0 && (
              <p className="text-sm text-emerald-500">{formatCurrency(paidTotal)} paid</p>
            )}
          </div>
        </div>
        
        {/* Pay Button for Client */}
        {isClient && unpaidTotal > 0 && (
          <button
            onClick={handlePayDeveloper}
            disabled={processingPayment}
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {processingPayment ? 'Processing...' : `Pay ${formatCurrency(unpaidTotal)}`}
          </button>
        )}
        
        {/* All paid message */}
        {isClient && unpaidTotal === 0 && paidTotal > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">All caught up!</span>
          </div>
        )}
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

      {/* Timeline / Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">History</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {workEntries.map((entry, index) => {
            const style = categoryStyles[entry.category];
            const isCompleted = entry.status === 'completed';
            const isExpanded = editingId === entry.id;
            const isPaid = entry.paid;
            
            return (
              <div key={entry.id} className={`relative ${isPaid ? 'opacity-60' : ''}`}>
                {/* Timeline connector */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-100" />
                
                <div 
                  className="relative flex items-start gap-4 p-4 pl-6 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setEditingId(isExpanded ? null : entry.id)}
                >
                  {/* Checkbox/Circle */}
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    {isPaid ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : isCompleted ? (
                      <div className={`h-5 w-5 rounded-full ${style.bg} flex items-center justify-center`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-medium ${isPaid ? 'text-gray-500' : 'text-gray-900'}`}>{entry.title}</h3>
                      <span className={`text-xs font-medium ${style.color} capitalize px-2 py-0.5 rounded-full ${style.light}`}>
                        {entry.category}
                      </span>
                      {isPaid && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                    
                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-600">{entry.description}</p>
                        
                        {entry.justification && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50">
                            <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-500">{entry.justification}</p>
                          </div>
                        )}
                        
                        {canEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {formatCurrency(entry.cost)}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
