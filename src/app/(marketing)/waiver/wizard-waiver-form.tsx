'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, Baby, AlertCircle, Check, Loader2, ArrowRight, UserPlus, Calendar } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'littlegrapplers_waiver_draft';

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const LIMITS = { name: 100, email: 254, phone: 12, signature: 150 };

type PlanType = 'month-to-month' | '3-month-paid-in-full';

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface WizardWaiverFormProps {
  locations: Location[];
}

interface FormData {
  locationId: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  planType: PlanType;
  digitalSignature: string;
  photoMediaConsent: boolean;
  agreedToTerms: boolean;
}

const initialFormData: FormData = {
  locationId: '',
  guardianFirstName: '',
  guardianLastName: '',
  guardianEmail: '',
  guardianPhone: '',
  childFirstName: '',
  childLastName: '',
  childDateOfBirth: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  planType: 'month-to-month',
  digitalSignature: '',
  photoMediaConsent: false,
  agreedToTerms: false,
};

export function WizardWaiverForm({ locations }: WizardWaiverFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formLoadTime] = useState(Date.now());

  // Step completion
  const isStep1Done = !!formData.locationId;
  const isStep2Done = !!(formData.guardianFirstName && formData.guardianLastName && formData.guardianEmail && formData.childFirstName && formData.childLastName);
  const isStep3Done = !!formData.planType;
  const isStep4Done = !!(formData.agreedToTerms && formData.digitalSignature);

  // Load draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData({ ...parsed, photoMediaConsent: false, agreedToTerms: false });
      }
    } catch (e) { console.error('Failed to load draft:', e); }
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      if (formData.guardianFirstName || formData.childFirstName || formData.guardianEmail) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [formData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhoneChange = (field: 'guardianPhone' | 'emergencyContactPhone') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: formatPhoneInput(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if ((Date.now() - formLoadTime) / 1000 < 5) {
      setErrorMessage('Please take your time filling out the form.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }
      setSubmitStatus('success');
      setFormData(initialFormData);
      clearDraft();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step header component
  const StepHeader = ({ step, title, subtitle, isOpen, isDone, canOpen }: {
    step: number; title: string; subtitle: string; isOpen: boolean; isDone: boolean; canOpen: boolean;
  }) => (
    <button
      type="button"
      onClick={() => canOpen && setActiveStep(step)}
      disabled={!canOpen}
      className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${canOpen ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
    >
      <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-xl transition-all ${
        isDone ? 'bg-green-500 text-white' : isOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        {isDone ? <Check className="h-6 w-6" /> : step}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-semibold ${!canOpen ? 'text-gray-400' : 'text-gray-900'}`}>{title}</h3>
        <p className="text-sm text-gray-500 truncate">{isDone ? 'Completed' : subtitle}</p>
      </div>
      <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  if (submitStatus === 'success') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Waiver Submitted!</h3>
          <p className="mt-2 text-gray-600">You&apos;re one step closer to starting your child&apos;s journey.</p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-950/5 p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h4>
          <div className="space-y-3">
            <Link href="/sign-up" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <UserPlus className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Your Account</p>
                  <p className="text-sm text-gray-500">Manage enrollments & track progress</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </Link>
            <Link href="/locations" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Class Schedules</p>
                  <p className="text-sm text-gray-500">Find a time that works</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </Link>
          </div>
        </div>
        <div className="text-center">
          <button onClick={() => setSubmitStatus('idle')} className="text-sm text-gray-500 hover:text-gray-700">
            Need to submit another waiver?
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* STEP 1: Location */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        <StepHeader step={1} title="Select Location" subtitle="Choose your daycare" isOpen={activeStep === 1} isDone={isStep1Done} canOpen={true} />
        {activeStep === 1 && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="pt-4 grid gap-3 sm:grid-cols-3">
              {locations.map((loc) => (
                <label key={loc.id} className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${formData.locationId === loc.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="locationId" value={loc.id} checked={formData.locationId === loc.id} onChange={(e) => { handleChange(e); setTimeout(() => setActiveStep(2), 300); }} className="sr-only" />
                  <p className="text-center font-medium">{loc.name}</p>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Details */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        <StepHeader step={2} title="Your Details" subtitle="Parent & child info" isOpen={activeStep === 2} isDone={isStep2Done} canOpen={isStep1Done} />
        {activeStep === 2 && (
          <div className="px-5 pb-5 border-t border-gray-100 space-y-5">
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Parent/Guardian</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} required maxLength={LIMITS.name} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="First name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} required maxLength={LIMITS.name} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="Last name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} required maxLength={LIMITS.email} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handlePhoneChange('guardianPhone')} maxLength={LIMITS.phone} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="000-000-0000" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Baby className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Child</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" name="childFirstName" value={formData.childFirstName} onChange={handleChange} required maxLength={LIMITS.name} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="First name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" name="childLastName" value={formData.childLastName} onChange={handleChange} required maxLength={LIMITS.name} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="Last name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" name="childDateOfBirth" value={formData.childDateOfBirth} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency Contact</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Name</label>
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} maxLength={LIMITS.name} className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="Emergency contact name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handlePhoneChange('emergencyContactPhone')} maxLength={LIMITS.phone} className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none" placeholder="000-000-0000" />
                  </div>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setActiveStep(3)} disabled={!isStep2Done} className="w-full rounded-xl bg-gray-900 py-3 font-medium text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
              Continue to Step 3
            </button>
          </div>
        )}
      </div>

      {/* STEP 3: Plan */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        <StepHeader step={3} title="Choose Plan" subtitle="Select membership" isOpen={activeStep === 3} isDone={isStep3Done} canOpen={isStep1Done && isStep2Done} />
        {activeStep === 3 && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="pt-4 grid gap-4 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.planType === 'month-to-month' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="planType" value="month-to-month" checked={formData.planType === 'month-to-month'} onChange={handleChange} className="sr-only" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">$50</p>
                  <p className="text-sm text-gray-500">per month</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">Monthly</p>
                  <p className="text-xs text-gray-400">Cancel anytime</p>
                </div>
              </label>
              <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.planType === '3-month-paid-in-full' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="planType" value="3-month-paid-in-full" checked={formData.planType === '3-month-paid-in-full'} onChange={handleChange} className="sr-only" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">$150</p>
                  <p className="text-sm text-gray-500">one-time</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">3 Months Prepaid</p>
                  <p className="text-xs text-gray-400">Best value</p>
                </div>
              </label>
            </div>
            <button type="button" onClick={() => setActiveStep(4)} disabled={!isStep3Done} className="mt-5 w-full rounded-xl bg-gray-900 py-3 font-medium text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
              Continue to Step 4
            </button>
          </div>
        )}
      </div>

      {/* STEP 4: Sign */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-950/5 overflow-hidden">
        <StepHeader step={4} title="Sign Agreement" subtitle="Review and sign" isOpen={activeStep === 4} isDone={isStep4Done} canOpen={isStep1Done && isStep2Done && isStep3Done} />
        {activeStep === 4 && (
          <div className="px-5 pb-5 border-t border-gray-100">
            <div className="pt-4 space-y-4">
              <label className="flex cursor-pointer items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                <input type="checkbox" name="photoMediaConsent" checked={formData.photoMediaConsent} onChange={handleChange} className="mt-0.5 h-5 w-5 rounded border-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Photo & Media Consent</p>
                  <p className="text-xs text-gray-500 mt-1">I grant permission to photograph or record my child for promotional purposes.</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required className="mt-0.5 h-5 w-5 rounded border-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 text-sm"><span className="text-red-500">*</span> Waiver Agreement</p>
                  <p className="text-xs text-gray-500 mt-1">I have read and agree to the Waiver and Release of Liability. I am the parent or legal guardian.</p>
                </div>
              </label>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="mb-3 text-sm text-gray-600">Sign by typing your full legal name:</p>
              <input type="text" name="digitalSignature" value={formData.digitalSignature} onChange={handleChange} required maxLength={LIMITS.signature} className="w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-center font-serif text-2xl italic text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none" placeholder="Your full legal name" />
              <p className="mt-2 text-center text-xs text-gray-400">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {submitStatus === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Error</p>
          </div>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      {isStep1Done && isStep2Done && isStep3Done && (
        <button type="submit" disabled={isSubmitting || !formData.agreedToTerms || !formData.digitalSignature} className="w-full rounded-xl bg-gray-900 py-4 font-medium text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </span>
          ) : (
            'Complete Enrollment'
          )}
        </button>
      )}

      <p className="text-center text-xs text-gray-400">
        Need help? Email <span className="text-gray-600">info@littlegrapplers.net</span>
      </p>
    </form>
  );
}
