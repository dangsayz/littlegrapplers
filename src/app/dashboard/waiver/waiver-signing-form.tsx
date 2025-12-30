'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, User, Phone, Mail, Baby, AlertCircle, Check, Loader2, Shield, Camera, CreditCard, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const STORAGE_KEY = 'littlegrapplers_dashboard_waiver_draft';

interface Location {
  id: string;
  name: string;
}

interface WaiverSigningFormProps {
  clerkUserId: string;
  userEmail: string;
  userName: string;
  locations?: Location[];
}

interface FormData {
  guardianFullName: string;
  guardianEmail: string;
  guardianPhone: string;
  childFullName: string;
  childDateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  locationId: string;
  digitalSignature: string;
  photoMediaConsent: boolean;
  agreedToTerms: boolean;
}

export function WaiverSigningForm({ clerkUserId, userEmail, userName, locations = [] }: WaiverSigningFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    guardianFullName: userName,
    guardianEmail: userEmail,
    guardianPhone: '',
    childFullName: '',
    childDateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    locationId: '',
    digitalSignature: '',
    photoMediaConsent: false,
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          guardianFullName: userName,
          guardianEmail: userEmail,
          photoMediaConsent: false,
          agreedToTerms: false,
        }));
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, [userName, userEmail]);

  // Auto-save to localStorage on form changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (formData.childFullName || formData.guardianPhone) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/dashboard/waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clerkUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit waiver');
      }

      setSubmitStatus('success');
      clearDraft();
      // Redirect to checkout after showing success message
      setTimeout(() => {
        router.push('/dashboard/checkout');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (submitStatus === 'success') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
            <Check className="h-10 w-10 text-brand" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Waiver Signed!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Great! The waiver for{' '}
            <span className="font-medium text-foreground">{formData.childFullName}</span>{' '}
            has been submitted.
          </p>
          <p className="mt-2 text-muted-foreground">
            Next step: Choose a membership plan to complete enrollment.
          </p>
          <div className="mt-8 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <p className="text-sm text-muted-foreground">
              Redirecting to checkout...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Enrollment Waiver
        </h1>
        <p className="text-muted-foreground mt-1">
          Please read and sign the waiver below to complete enrollment
        </p>
      </div>

      {/* Waiver Document */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand" />
            Little Grapplers Waiver and Enrollment Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground max-h-96 overflow-y-auto pr-4">
            <p>
              I, the undersigned parent or legal guardian, hereby give my permission for my child to participate in physical activities, including Brazilian Jiu-Jitsu Training and Aerobics (hereinafter referred to as "Activities") at Little Grapplers, under the supervision of instructors and staff.
            </p>

            <p>
              I understand that participation in these Activities may involve physical exertion and carry risks, including injury, illness, and I voluntarily assume all risks associated with my child's participation. I confirm that my child is in good physical condition and able to safely participate in these Activities.
            </p>

            <p>
              <strong className="text-foreground">I hereby release, waive, and hold harmless Little Grapplers, Stephen Shnayderman, and their officers, staff, employees, agents, or representatives (hereinafter referred to as "Releasees")</strong> from any and all claims, demands, or causes of action arising from or related to any injury, loss, or damage, including death, that may occur while my child is participating in the Activities or while on the premises of Little Grapplers.
            </p>

            <p>
              I understand that my child's participation is voluntary, and I, as the parent/guardian, accept full responsibility for any potential risks, injuries, or damages that may occur.
            </p>

            <p>
              It is my expressed intent that this Waiver and Release of Liability shall apply not only to me but also to my child, family members, heirs, executors, administrators, and anyone else involved in or related to my child's participation in these Activities.
            </p>

            <p className="text-sm italic">
              This agreement is made with the understanding that the laws of the State of Texas shall govern its interpretation.
            </p>

            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Camera className="h-4 w-4 text-brand" />
                <h4 className="font-semibold text-foreground">Photography and Media Release</h4>
              </div>
              <p className="text-sm">
                By signing below, you grant Little Grapplers LLC permission to photograph or record your child during activities for marketing, promotional, or educational purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guardian Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-brand" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Child Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="h-5 w-5 text-orange" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Location Selection */}
        {locations.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                Daycare Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label htmlFor="locationId" className="mb-2 block text-sm font-medium">
                Select your child's daycare location <span className="text-coral">*</span>
              </label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">Select a location...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-coral" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Consent Checkboxes */}
        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
            <input
              type="checkbox"
              name="photoMediaConsent"
              checked={formData.photoMediaConsent}
              onChange={handleChange}
              className="mt-1 h-5 w-5 rounded border-border text-brand focus:ring-brand"
            />
            <span className="text-sm text-muted-foreground">
              I grant Little Grapplers LLC permission to photograph or record my child during activities for marketing, promotional, or educational purposes.
            </span>
          </label>
          
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              required
              className="mt-1 h-5 w-5 rounded border-border text-brand focus:ring-brand"
            />
            <span className="text-sm text-muted-foreground">
              <span className="text-coral">*</span> I have read, understood, and agree to the Waiver and Release of Liability above. I confirm that I am the parent or legal guardian of the child named above.
            </span>
          </label>
        </div>

        {/* Digital Signature */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Digital Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              By typing your full legal name below, you are electronically signing this waiver.
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
          </CardContent>
        </Card>

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
          disabled={isSubmitting || !formData.agreedToTerms || !formData.digitalSignature || !formData.childFullName || (locations.length > 0 && !formData.locationId)}
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
    </div>
  );
}
