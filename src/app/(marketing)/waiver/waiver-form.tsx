'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, User, Phone, Mail, Baby, AlertCircle, Check, Loader2, ArrowRight, UserPlus, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'littlegrapplers_waiver_draft';

// Format phone number as user types: 000-000-0000
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Character limits
const LIMITS = {
  name: 100,
  email: 254,
  phone: 12,
  signature: 150,
};

type PlanType = 'month-to-month' | '3-month' | '6-month';

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface WaiverFormProps {
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

export function WaiverForm({ locations }: WaiverFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formLoadTime] = useState(Date.now());
  const [hasDraft, setHasDraft] = useState(false);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't restore checkboxes for legal compliance
        setFormData({
          ...parsed,
          photoMediaConsent: false,
          agreedToTerms: false,
        });
        setHasDraft(true);
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, []);

  // Auto-save to localStorage on form changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Only save if there's meaningful data
        if (formData.guardianFirstName || formData.childFirstName || formData.guardianEmail) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Clear draft on successful submission
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhoneChange = (field: 'guardianPhone' | 'emergencyContactPhone') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: formatPhoneInput(e.target.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Anti-bot timing check
    const elapsed = (Date.now() - formLoadTime) / 1000;
    if (elapsed < 5) {
      setErrorMessage('Please take your time filling out the form.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Client-side validation
    if (formData.guardianPhone && !/^\d{3}-\d{3}-\d{4}$/.test(formData.guardianPhone)) {
      setErrorMessage('Please enter a valid phone number (000-000-0000).');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.guardianEmail)) {
      setErrorMessage('Please enter a valid email address.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit waiver');
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

  if (submitStatus === 'success') {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Check className="h-8 w-8 text-brand" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground">
            Waiver Submitted Successfully
          </h3>
          <p className="mt-2 text-muted-foreground">
            You&apos;re one step closer to starting your child&apos;s journey.
          </p>
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="text-lg font-display font-bold text-foreground mb-4">
            Complete Your Enrollment
          </h4>
          <div className="space-y-3">
            <Link
              href="/sign-up"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-brand/50 hover:bg-brand/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <UserPlus className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Create Your Account</p>
                  <p className="text-sm text-muted-foreground">Manage enrollments & track progress</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors" />
            </Link>

            <Link
              href="/locations"
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-brand/50 hover:bg-brand/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Class Schedules</p>
                  <p className="text-sm text-muted-foreground">Find a location & time that works</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors" />
            </Link>
          </div>
        </div>

        {/* Secondary Action */}
        <div className="text-center">
          <button
            onClick={() => setSubmitStatus('idle')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Need to submit another waiver?
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location Selection */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2EC4B6]/10">
            <MapPin className="h-5 w-5 text-[#2EC4B6]" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Select Your Location</h3>
            <p className="text-sm text-muted-foreground">Choose the daycare location for your child</p>
          </div>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-3">
          {locations.map((location) => (
            <label
              key={location.id}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                formData.locationId === location.id
                  ? 'border-[#2EC4B6] bg-[#2EC4B6]/5 shadow-md'
                  : 'border-border hover:border-[#2EC4B6]/50 hover:bg-[#2EC4B6]/5'
              }`}
            >
              <input
                type="radio"
                name="locationId"
                value={location.id}
                checked={formData.locationId === location.id}
                onChange={handleChange}
                required
                className="sr-only"
              />
              <div className="text-center">
                <p className="font-semibold text-foreground">{location.name}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Guardian Information */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <User className="h-5 w-5 text-brand" />
          </div>
          <h3 className="text-xl font-display font-bold">Parent/Guardian Information</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guardianFirstName" className="mb-2 block text-sm font-medium">
              First Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="guardianFirstName"
              name="guardianFirstName"
              value={formData.guardianFirstName}
              onChange={handleChange}
              required
              maxLength={LIMITS.name}
              pattern="[a-zA-Z\s'-]+"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="First name"
            />
          </div>
          
          <div>
            <label htmlFor="guardianLastName" className="mb-2 block text-sm font-medium">
              Last Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="guardianLastName"
              name="guardianLastName"
              value={formData.guardianLastName}
              onChange={handleChange}
              required
              maxLength={LIMITS.name}
              pattern="[a-zA-Z\s'-]+"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Last name"
            />
          </div>
          
          <div>
            <label htmlFor="guardianEmail" className="mb-2 block text-sm font-medium">
              Email Address <span className="text-coral">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                id="guardianEmail"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                required
                maxLength={LIMITS.email}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="guardianPhone" className="mb-2 block text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                id="guardianPhone"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handlePhoneChange('guardianPhone')}
                maxLength={LIMITS.phone}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="000-000-0000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Child Information */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10">
            <Baby className="h-5 w-5 text-orange" />
          </div>
          <h3 className="text-xl font-display font-bold">Child Information</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="childFirstName" className="mb-2 block text-sm font-medium">
              Child's First Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="childFirstName"
              name="childFirstName"
              value={formData.childFirstName}
              onChange={handleChange}
              required
              maxLength={LIMITS.name}
              pattern="[a-zA-Z\s'-]+"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="First name"
            />
          </div>
          
          <div>
            <label htmlFor="childLastName" className="mb-2 block text-sm font-medium">
              Child's Last Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="childLastName"
              name="childLastName"
              value={formData.childLastName}
              onChange={handleChange}
              required
              maxLength={LIMITS.name}
              pattern="[a-zA-Z\s'-]+"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Last name"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="childDateOfBirth" className="mb-2 block text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              id="childDateOfBirth"
              name="childDateOfBirth"
              value={formData.childDateOfBirth}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10">
            <AlertCircle className="h-5 w-5 text-coral" />
          </div>
          <h3 className="text-xl font-display font-bold">Emergency Contact</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="emergencyContactName" className="mb-2 block text-sm font-medium">
              Contact Name
            </label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              maxLength={LIMITS.name}
              pattern="[a-zA-Z\s'-]+"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Emergency contact name"
            />
          </div>
          
          <div>
            <label htmlFor="emergencyContactPhone" className="mb-2 block text-sm font-medium">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handlePhoneChange('emergencyContactPhone')}
                maxLength={LIMITS.phone}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="000-000-0000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow/10">
            <FileText className="h-5 w-5 text-yellow" />
          </div>
          <h3 className="text-xl font-display font-bold">Membership Plan</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <label
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              formData.planType === 'month-to-month'
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/50'
            }`}
          >
            <input
              type="radio"
              name="planType"
              value="month-to-month"
              checked={formData.planType === 'month-to-month'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">$65</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <p className="mt-2 text-xs font-medium text-brand">Month-to-Month</p>
            </div>
          </label>
          
          <label
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              formData.planType === '3-month'
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/50'
            }`}
          >
            <input
              type="radio"
              name="planType"
              value="3-month"
              checked={formData.planType === '3-month'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">$50</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <p className="mt-2 text-xs font-medium text-brand">3-Month Plan</p>
            </div>
          </label>
          
          <label
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              formData.planType === '6-month'
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/50'
            }`}
          >
            <input
              type="radio"
              name="planType"
              value="6-month"
              checked={formData.planType === '6-month'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">$50</p>
              <p className="text-sm text-muted-foreground">per month</p>
              <p className="mt-2 text-xs font-medium text-brand">6-Month Plan</p>
            </div>
          </label>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="photoMediaConsent"
            checked={formData.photoMediaConsent}
            onChange={handleChange}
            className="mt-1 h-5 w-5 rounded border-border text-brand focus:ring-brand"
          />
          <span className="text-sm text-muted-foreground">
            I grant Little Grapplers LLC permission to photograph or record my child during activities for marketing, promotional, or educational purposes. I understand my child's name will not be used without my consent.
          </span>
        </label>
        
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            required
            className="mt-1 h-5 w-5 rounded border-border text-brand focus:ring-brand"
          />
          <span className="text-sm text-muted-foreground">
            <span className="text-coral">*</span> I have read, understood, and agree to the Waiver and Release of Liability and Enrollment Policy outlined above. I confirm that I am the parent or legal guardian of the child named above.
          </span>
        </label>
      </div>

      {/* Digital Signature */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-xl font-display font-bold">Digital Signature</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          By typing your full legal name below, you are electronically signing this waiver and enrollment agreement.
        </p>
        <input
          type="text"
          id="digitalSignature"
          name="digitalSignature"
          value={formData.digitalSignature}
          onChange={handleChange}
          required
          maxLength={LIMITS.signature}
          pattern="[a-zA-Z\s'-]+"
          className="w-full rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-center font-display text-xl italic text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
          placeholder="Type your full legal name as signature"
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-4 text-coral">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Error submitting waiver</p>
          </div>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.agreedToTerms || !formData.digitalSignature}
        className="w-full rounded-full bg-brand py-4 font-medium text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </span>
        ) : (
          'Sign and Submit Waiver'
        )}
      </button>
    </form>
  );
}
