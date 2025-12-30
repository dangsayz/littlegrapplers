'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Send, ArrowRight, Clock, CheckCircle, Loader2, MessageSquare } from 'lucide-react';

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
  message: 2000,
  shortText: 200,
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';
import { FadeIn } from '@/components/ui/motion';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [formLoadTime] = useState(Date.now());

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Check honeypot (should be empty)
    const honeypot = formData.get('website') as string;
    if (honeypot) {
      // Bot detected, silently fail
      setIsSubmitted(true);
      return;
    }

    // Check submission timing (too fast = bot)
    const elapsed = (Date.now() - formLoadTime) / 1000;
    if (elapsed < 3) {
      setError('Please take your time filling out the form.');
      setIsSubmitting(false);
      return;
    }

    const data = {
      firstName: (formData.get('firstName') as string).trim(),
      lastName: (formData.get('lastName') as string).trim(),
      email: (formData.get('email') as string).trim().toLowerCase(),
      phone: phone,
      hearAbout: formData.get('hearAbout') as string,
      message: (formData.get('message') as string).trim(),
    };

    // Client-side validation
    if (!data.firstName || !data.lastName) {
      setError('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(data.phone)) {
      setError('Please enter a valid phone number (000-000-0000).');
      setIsSubmitting(false);
      return;
    }

    if (data.message.length < 10) {
      setError('Please enter a message with at least 10 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F9]">
      {/* Hero Section */}
      <section className="relative bg-[#1F2A44] py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2EC4B6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F7931E]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2EC4B6]/10 border border-[#2EC4B6]/20 mb-6">
              <MessageSquare className="h-4 w-4 text-[#2EC4B6]" />
              <span className="text-sm font-medium text-[#2EC4B6]">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Let's Start a{' '}
              <span className="text-[#2EC4B6]">Conversation</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
              Whether you're a daycare provider, a parent eager to empower your child, or simply curious about our program—we're here to help!
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Contact Info Sidebar */}
            <FadeIn direction="up" className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2A44]">Contact Information</h2>
                <p className="mt-2 text-[#1F2A44]/60">
                  Reach out directly or fill out the form.
                </p>
              </div>

              <div className="space-y-6">
                <a 
                  href="mailto:sshnaydbjj@gmail.com"
                  className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-[#1F2A44]/10 hover:border-[#2EC4B6] hover:shadow-lg hover:shadow-[#2EC4B6]/10 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2EC4B6]/10 group-hover:bg-[#2EC4B6] transition-colors">
                    <Mail className="h-5 w-5 text-[#2EC4B6] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2A44]">Email Us</div>
                    <div className="text-[#1F2A44]/60 group-hover:text-[#2EC4B6] transition-colors">
                      sshnaydbjj@gmail.com
                    </div>
                  </div>
                </a>

                <a 
                  href="tel:+14692095814"
                  className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-[#1F2A44]/10 hover:border-[#F7931E] hover:shadow-lg hover:shadow-[#F7931E]/10 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7931E]/10 group-hover:bg-[#F7931E] transition-colors">
                    <Phone className="h-5 w-5 text-[#F7931E] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2A44]">Call Us</div>
                    <div className="text-[#1F2A44]/60 group-hover:text-[#F7931E] transition-colors">
                      (469) 209-5814
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#1F2A44]/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFC857]/10">
                    <MapPin className="h-5 w-5 text-[#FFC857]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2A44]">Locations</div>
                    <div className="text-[#1F2A44]/60">
                      Multiple daycare locations citywide
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-[#2EC4B6]/10 to-[#8FE3CF]/10 border border-[#2EC4B6]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-[#2EC4B6]" />
                  <h3 className="font-semibold text-[#1F2A44]">Response Time</h3>
                </div>
                <p className="text-sm text-[#1F2A44]/70">
                  We typically respond within 24 hours during business days. For urgent inquiries, please call us directly.
                </p>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn direction="up" delay={0.1} className="lg:col-span-3">
              <div className="rounded-2xl bg-white border border-[#1F2A44]/10 shadow-xl shadow-[#1F2A44]/5 p-6 md:p-10">
                {isSubmitted ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2EC4B6]/10">
                      <CheckCircle className="h-10 w-10 text-[#2EC4B6]" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-[#1F2A44]">Message Sent!</h3>
                    <p className="mt-3 text-[#1F2A44]/60 max-w-sm mx-auto">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      className="mt-8 bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white" 
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#1F2A44]">Send us a Message</h3>
                      <p className="mt-1 text-[#1F2A44]/60">Fill out the form below and we'll be in touch soon.</p>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 rounded-lg bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 text-[#FF5A5F] text-sm">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot field - hidden from users, bots will fill it */}
                      <div className="hidden" aria-hidden="true">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-[#1F2A44] font-medium">First Name *</Label>
                          <Input 
                            id="firstName" 
                            name="firstName" 
                            required 
                            maxLength={LIMITS.name}
                            pattern="[a-zA-Z\s'-]+"
                            placeholder="John" 
                            className="h-12 border-[#1F2A44]/20 focus:border-[#2EC4B6] focus:ring-[#2EC4B6]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-[#1F2A44] font-medium">Last Name *</Label>
                          <Input 
                            id="lastName" 
                            name="lastName" 
                            required 
                            maxLength={LIMITS.name}
                            pattern="[a-zA-Z\s'-]+"
                            placeholder="Doe"
                            className="h-12 border-[#1F2A44]/20 focus:border-[#2EC4B6] focus:ring-[#2EC4B6]"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[#1F2A44] font-medium">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            maxLength={LIMITS.email}
                            placeholder="john@example.com"
                            className="h-12 border-[#1F2A44]/20 focus:border-[#2EC4B6] focus:ring-[#2EC4B6]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-[#1F2A44] font-medium">Phone *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            maxLength={LIMITS.phone}
                            placeholder="000-000-0000"
                            className="h-12 border-[#1F2A44]/20 focus:border-[#2EC4B6] focus:ring-[#2EC4B6]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hearAbout" className="text-[#1F2A44] font-medium">How did you hear about us? *</Label>
                        <select
                          id="hearAbout"
                          name="hearAbout"
                          required
                          className="flex h-12 w-full rounded-md border border-[#1F2A44]/20 bg-white text-[#1F2A44] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent transition-colors"
                        >
                          <option value="">Select an option</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Google">Google</option>
                          <option value="Word of Mouth">Word of mouth</option>
                          <option value="Daycare Referral">Daycare referral</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-[#1F2A44] font-medium">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          minLength={10}
                          maxLength={LIMITS.message}
                          placeholder="Tell us how we can help you... (min 10 characters)"
                          rows={5}
                          className="border-[#1F2A44]/20 focus:border-[#2EC4B6] focus:ring-[#2EC4B6] resize-none"
                        />
                        <p className="text-xs text-[#1F2A44]/50 text-right">Max {LIMITS.message} characters</p>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-base font-semibold bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white shadow-lg shadow-[#2EC4B6]/25" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 md:py-24 bg-[#1F2A44]">
        <Container>
          <FadeIn direction="up" className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Have More <span className="text-[#2EC4B6]">Questions?</span>
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-xl mx-auto">
              Check out our frequently asked questions for quick answers about our program.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white h-12 px-8"
                asChild
              >
                <Link href="/faq">
                  View FAQ
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
