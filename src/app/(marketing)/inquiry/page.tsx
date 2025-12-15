'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';

export default function InquiryPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
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
      <section className="py-16 md:py-24 bg-foreground text-background">
        <Container>
          <div className="max-w-3xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-background/60 hover:text-background transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight">
              GET<br />
              <span className="text-brand">STARTED.</span>
            </h1>
            <p className="mt-6 text-lg text-background/70 max-w-xl">
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
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required placeholder="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="(555) 123-4567" />
              </div>
            </div>

            {/* Child Info */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-2xl font-bold">Child Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name *</Label>
                  <Input id="childName" name="childName" required placeholder="Child's first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Child's Age *</Label>
                  <Input id="childAge" name="childAge" type="number" min="3" max="6" required placeholder="3-6" />
                </div>
              </div>
            </div>

            {/* Daycare Info */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-2xl font-bold">Daycare Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="daycareName">Daycare Name *</Label>
                <Input id="daycareName" name="daycareName" required placeholder="ABC Daycare Center" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daycareAddress">Daycare Address</Label>
                <Input id="daycareAddress" name="daycareAddress" placeholder="123 Main St, Dallas, TX" />
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
                  placeholder="Tell us anything else you'd like us to know..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearAbout">How did you hear about us?</Label>
                <Input id="hearAbout" name="hearAbout" placeholder="Social media, friend, daycare, etc." />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button type="submit" size="xl" variant="brand" className="w-full" disabled={isLoading}>
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
