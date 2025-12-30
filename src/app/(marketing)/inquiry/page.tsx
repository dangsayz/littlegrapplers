'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';

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
  message: 1000,
  address: 300,
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';

export default function InquiryPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [formLoadTime] = useState(Date.now());

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    // Check honeypot
    const honeypot = formData.get('company_website') as string;
    if (honeypot) {
      setIsSubmitted(true);
      return;
    }

    // Anti-bot timing check
    const elapsed = (Date.now() - formLoadTime) / 1000;
    if (elapsed < 3) {
      setError('Please take your time filling out the form.');
      setIsLoading(false);
      return;
    }

    // Validate phone format
    if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
      setError('Please enter a valid phone number (000-000-0000).');
      setIsLoading(false);
      return;
    }
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="min-h-[80vh] flex items-center py-24">
        <Container size="sm">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-8">
              <CheckCircle2 className="w-10 h-10 text-brand" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">
              THANK YOU!
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md mx-auto">
              A Little Grapplers coach will reach out to you as soon as possible. We're excited to help empower your child!
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-muted text-foreground">
        <Container>
          <div className="max-w-3xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight">
              GET<br />
              <span className="text-brand">STARTED.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Fill out the form below and a Little Grapplers coach will reach out to you ASAP to discuss how we can bring BJJ to your child's daycare.
            </p>
          </div>
        </Container>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24">
        <Container size="sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Parent Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Your Information</h2>
              
              {/* Honeypot field */}
              <div className="hidden" aria-hidden="true">
                <Label htmlFor="company_website">Company Website</Label>
                <Input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required maxLength={LIMITS.name} pattern="[a-zA-Z\s'-]+" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required maxLength={LIMITS.name} pattern="[a-zA-Z\s'-]+" placeholder="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" required maxLength={LIMITS.email} placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" required value={phone} onChange={handlePhoneChange} maxLength={LIMITS.phone} placeholder="000-000-0000" />
              </div>
            </div>

            {/* Child Info */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-2xl font-bold">Child Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name *</Label>
                  <Input id="childName" name="childName" required maxLength={LIMITS.name} pattern="[a-zA-Z\s'-]+" placeholder="Child's first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Child's Age *</Label>
                  <Input id="childAge" name="childAge" type="number" min="3" max="12" required placeholder="3-12" />
                </div>
              </div>
            </div>

            {/* Daycare Info */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-2xl font-bold">Daycare Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="daycareName">Daycare Name *</Label>
                <Input id="daycareName" name="daycareName" required maxLength={LIMITS.name} placeholder="ABC Daycare Center" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daycareAddress">Daycare Address</Label>
                <Input id="daycareAddress" name="daycareAddress" maxLength={LIMITS.address} placeholder="123 Main St, Dallas, TX" />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-2xl font-bold">Additional Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="message">Questions or Comments</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  maxLength={LIMITS.message}
                  placeholder="Tell us anything else you'd like us to know..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">Max {LIMITS.message} characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearAbout">How did you hear about us?</Label>
                <Input id="hearAbout" name="hearAbout" placeholder="Social media, friend, daycare, etc." />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full bg-brand hover:bg-brand/90 text-white h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Inquiry
                  </>
                )}
              </Button>
              <p className="mt-4 text-sm text-center text-muted-foreground">
                A Little Grapplers coach will reach out to you as soon as possible.
              </p>
            </div>
          </form>
        </Container>
      </section>
    </>
  );
}
