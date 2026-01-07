'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { faqCategories } from './faq-data';

export default function FAQContent() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-background" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Got Questions?
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black leading-[0.9] tracking-tight">
              Frequently Asked<br />
              <span className="font-serif italic font-normal text-brand">Questions.</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Everything you need to know about Little Grapplers. Can't find what you're looking
              for? Reach out to our team.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* FAQ Accordion */}
      <section className="py-32 md:py-40">
        <Container>
          <div className="mx-auto max-w-3xl">
            {faqCategories.map((category, categoryIndex) => (
              <FadeIn key={category.name} direction="up" delay={categoryIndex * 0.1}>
                <div className="mb-12">
                  <h2 className="mb-6 text-xl font-semibold text-brand">{category.name}</h2>
                  <div className="space-y-3">
                    {category.questions.map((item, index) => {
                      const itemId = `${category.name}-${index}`;
                      const isOpen = openItems[itemId];

                      return (
                        <div
                          key={itemId}
                          className="overflow-hidden rounded-lg border border-border bg-card"
                        >
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted"
                            aria-expanded={isOpen}
                          >
                            <span className="font-medium pr-4 text-foreground">{item.question}</span>
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                                isOpen && 'rotate-180'
                              )}
                            />
                          </button>
                          <div
                            className={cn(
                              'grid transition-all duration-200 ease-in-out',
                              isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="border-t border-border px-6 py-4 text-muted-foreground">
                                {item.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Still have questions */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted to-muted" />
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 mb-8">
              <HelpCircle className="h-8 w-8 text-brand" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Need More Help?
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              Still Have <span className="font-serif italic font-normal text-brand">Questions?</span>
            </h2>
            <p className="mt-8 text-xl text-muted-foreground max-w-xl mx-auto">
              We're here to help! Reach out to our team and we'll get back to you within 24
              hours.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-brand hover:bg-brand/90 text-white h-12 px-8" asChild>
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-12 px-8"
                asChild
              >
                <Link href="/locations">Find a Location</Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
