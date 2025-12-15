'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">We'd Love to Hear from You!</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're a daycare provider looking to bring the transformative art of Brazilian Jiu-Jitsu to your center, a parent eager to empower your child with confidence and discipline, or simply curious about our program, we're here to help!
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              This isn't just a program—it's a movement to build a brighter future, one confident, resilient child at a time. Have questions, feedback, or just want to chat about how Jiu-Jitsu can make a difference for your kids? Don't hesitate to reach out.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section className="section-padding">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold">Questions?</h2>
              <p className="mt-2 text-muted-foreground">
                We're here to help.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Email</div>
                    <a
                      href="mailto:sshnaydbjj@gmail.com"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      sshnaydbjj@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Phone</div>
                    <a
                      href="tel:+14692095814"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      +1 (469) 209-5814
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Locations</div>
                    <p className="text-muted-foreground">Multiple daycare locations citywide</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium">Response Time</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border bg-card p-6 md:p-8">
                {isSubmitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                      <svg
                        className="h-8 w-8 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">Message Sent!</h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button className="mt-6" onClick={() => setIsSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" name="firstName" required placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" name="lastName" required placeholder="Doe" />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hearAbout">How did you hear about us? *</Label>
                      <select
                        id="hearAbout"
                        name="hearAbout"
                        required
                        className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select an option</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="google">Google</option>
                        <option value="word-of-mouth">Word of mouth</option>
                        <option value="other">Others</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us how we can help..."
                        rows={5}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                      <Send className="h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Teaser */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Have More Questions?</h2>
            <p className="mt-2 text-muted-foreground">
              Check out our frequently asked questions for quick answers.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/faq">View FAQ</a>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
