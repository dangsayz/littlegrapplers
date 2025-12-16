'use client';

import { useState } from 'react';
import { FileText, User, Phone, Mail, Baby, AlertCircle, Check, Loader2 } from 'lucide-react';

type PlanType = 'month-to-month' | '3-month' | '6-month';

interface FormData {
  guardianFullName: string;
  guardianEmail: string;
  guardianPhone: string;
  childFullName: string;
  childDateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  planType: PlanType;
  digitalSignature: string;
  photoMediaConsent: boolean;
  agreedToTerms: boolean;
}

const initialFormData: FormData = {
  guardianFullName: '',
  guardianEmail: '',
  guardianPhone: '',
  childFullName: '',
  childDateOfBirth: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  planType: 'month-to-month',
  digitalSignature: '',
  photoMediaConsent: false,
  agreedToTerms: false,
};

export function WaiverForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waiver', {
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
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <Check className="h-8 w-8 text-brand" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground">
          Waiver Submitted Successfully
        </h3>
        <p className="mt-2 text-muted-foreground">
          Thank you for completing the enrollment waiver. We will be in touch shortly with next steps.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand/90"
        >
          Submit Another Waiver
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Guardian Information */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <User className="h-5 w-5 text-brand" />
          </div>
          <h3 className="text-xl font-display font-bold">Parent/Guardian Information</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="guardianFullName" className="mb-2 block text-sm font-medium">
              Full Legal Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="guardianFullName"
              name="guardianFullName"
              value={formData.guardianFullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Enter your full legal name"
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
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="(555) 123-4567"
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
            <label htmlFor="childFullName" className="mb-2 block text-sm font-medium">
              Child's Full Name <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="childFullName"
              name="childFullName"
              value={formData.childFullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="Enter child's full name"
            />
          </div>
          
          <div>
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
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="(555) 123-4567"
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
