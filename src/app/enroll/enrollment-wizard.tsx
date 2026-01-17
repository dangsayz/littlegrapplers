'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  User, 
  CreditCard, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Loader2,
  FileText,
  Shield,
  Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
}

interface EnrollmentWizardProps {
  locations: Location[];
}

type Step = 'child' | 'location' | 'waiver' | 'payment';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 50,
    priceDisplay: '$50',
    period: '/month',
    description: 'Cancel anytime',
  },
  {
    id: '3month',
    name: '3 Months',
    price: 150,
    priceDisplay: '$150',
    period: 'one time',
    description: 'Best value',
    popular: true,
  },
];

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function EnrollmentWizard({ locations }: EnrollmentWizardProps) {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  
  const [step, setStep] = useState<Step>('child');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    childFirstName: '',
    childLastName: '',
    childDateOfBirth: '',
    locationId: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    digitalSignature: '',
    photoMediaConsent: false,
    agreedToTerms: false,
    planType: 'monthly' as 'monthly' | '3month',
  });

  useEffect(() => {
    if (cancelled) {
      setError('Payment was cancelled. Your information has been saved - you can try again.');
      setStep('payment');
    }
  }, [cancelled]);

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'child', label: 'Child', icon: <Baby className="h-4 w-4" /> },
    { key: 'location', label: 'Location', icon: <MapPin className="h-4 w-4" /> },
    { key: 'waiver', label: 'Waiver', icon: <FileText className="h-4 w-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue = value;
    if (name === 'guardianPhone' || name === 'emergencyContactPhone') {
      processedValue = formatPhoneInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 'child':
        if (!formData.childFirstName.trim() || !formData.childLastName.trim()) {
          setError('Please enter your child\'s name');
          return false;
        }
        return true;
      case 'location':
        if (!formData.locationId) {
          setError('Please select a location');
          return false;
        }
        return true;
      case 'waiver':
        if (!formData.guardianFirstName.trim() || !formData.guardianLastName.trim()) {
          setError('Please enter guardian name');
          return false;
        }
        if (!formData.guardianEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail)) {
          setError('Please enter a valid email');
          return false;
        }
        if (!formData.digitalSignature.trim()) {
          setError('Please sign the waiver');
          return false;
        }
        if (!formData.agreedToTerms) {
          setError('Please agree to the terms');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key);
      setError(null);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].key);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/enrollment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process enrollment');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-2 ${
              index <= currentStepIndex ? 'text-brand' : 'text-muted-foreground'
            }`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                index < currentStepIndex 
                  ? 'bg-brand border-brand text-white' 
                  : index === currentStepIndex 
                    ? 'border-brand text-brand' 
                    : 'border-muted-foreground/30'
              }`}>
                {index < currentStepIndex ? <Check className="h-4 w-4" /> : s.icon}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-2 h-0.5 w-8 sm:w-12 ${
                index < currentStepIndex ? 'bg-brand' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <Card className="border-border">
        <CardContent className="p-6">
          {/* Step 1: Child Info */}
          {step === 'child' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
                  <Baby className="h-6 w-6 text-brand" />
                </div>
                <h2 className="text-xl font-display font-bold">Child Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your child&apos;s details</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="childFirstName"
                    value={formData.childFirstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Child's first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="childLastName"
                    value={formData.childLastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Child's last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth (optional)</label>
                <input
                  type="date"
                  name="childDateOfBirth"
                  value={formData.childDateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-brand" />
                </div>
                <h2 className="text-xl font-display font-bold">Choose Location</h2>
                <p className="text-sm text-muted-foreground mt-1">Select where {formData.childFirstName || 'your child'} will attend</p>
              </div>
              
              <div className="grid gap-3">
                {locations.map((location) => (
                  <label
                    key={location.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.locationId === location.id
                        ? 'border-brand bg-brand/5'
                        : 'border-border hover:border-brand/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="locationId"
                      value={location.id}
                      checked={formData.locationId === location.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      formData.locationId === location.id ? 'border-brand' : 'border-muted-foreground/30'
                    }`}>
                      {formData.locationId === location.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">{location.city}, {location.state}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Waiver */}
          {step === 'waiver' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-brand" />
                </div>
                <h2 className="text-xl font-display font-bold">Guardian & Waiver</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete the required information</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Guardian First Name *</label>
                  <input
                    type="text"
                    name="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Guardian Last Name *</label>
                  <input
                    type="text"
                    name="guardianLastName"
                    value={formData.guardianLastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="guardianEmail"
                  value={formData.guardianEmail}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  placeholder="000-000-0000"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium mb-2">Digital Signature *</label>
                <input
                  type="text"
                  name="digitalSignature"
                  value={formData.digitalSignature}
                  onChange={handleChange}
                  placeholder="Type your full legal name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-cursive text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">By signing, you agree to the liability waiver</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="photoMediaConsent"
                    checked={formData.photoMediaConsent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-muted-foreground">
                    I consent to photos/videos of my child being used for promotional purposes
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the terms and conditions and liability waiver *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-brand" />
                </div>
                <h2 className="text-xl font-display font-bold">Choose Your Plan</h2>
                <p className="text-sm text-muted-foreground mt-1">Select a membership for {formData.childFirstName}</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {PLANS.map((plan) => (
                  <label
                    key={plan.id}
                    className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.planType === plan.id
                        ? 'border-brand bg-brand/5'
                        : 'border-border hover:border-brand/50'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-brand text-white text-xs font-semibold rounded-full">
                        BEST VALUE
                      </span>
                    )}
                    <input
                      type="radio"
                      name="planType"
                      value={plan.id}
                      checked={formData.planType === plan.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{plan.name}</span>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        formData.planType === plan.id ? 'border-brand' : 'border-muted-foreground/30'
                      }`}>
                        {formData.planType === plan.id && (
                          <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Shield className="h-5 w-5 text-brand flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Secure payment powered by Stripe. Your payment info is never stored on our servers.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className={currentStepIndex === 0 ? 'invisible' : ''}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {step === 'payment' ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={nextStep}>
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
