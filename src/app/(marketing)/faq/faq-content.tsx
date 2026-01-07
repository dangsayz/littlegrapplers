'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { cn } from '@/lib/utils';

export const faqCategories = [
  {
    name: 'Getting Started',
    questions: [
      {
        question: 'What age can my child start BJJ?',
        answer:
          'Our Tiny Grapplers program accepts children as young as 3 years old. We have age-appropriate programs for children up to 12 years old. Each program is designed specifically for the developmental stage of that age group.',
      },
      {
        question: 'Does my child need any prior martial arts experience?',
        answer:
          'Not at all! Our programs are designed for complete beginners. We focus on fundamentals and progress at a pace appropriate for each child. Experienced students are also welcome and will be challenged appropriately.',
      },
      {
        question: 'What should my child wear to class?',
        answer:
          'For the first few classes, comfortable athletic clothing works fine—shorts or sweatpants and a t-shirt. Once enrolled, students will need a BJJ gi (uniform). We can recommend affordable options for kids that grow fast!',
      },
      {
        question: 'How do I enroll my child?',
        answer:
          'First, check if your daycare facility is one of our partner locations. If so, you can register directly through our website. If not, contact us to express interest and we may be able to work with your daycare to start a program.',
      },
    ],
  },
  {
    name: 'Programs & Schedule',
    questions: [
      {
        question: 'How often are classes held?',
        answer:
          'Class frequency varies by location and program, but typically ranges from 2-3 times per week. Each class is 30-60 minutes depending on the age group. Check your specific location for the exact schedule.',
      },
      {
        question: 'What happens during a typical class?',
        answer:
          "Classes begin with a warm-up including BJJ-specific movements, followed by technique instruction and drilling. Depending on the age group, classes may include controlled sparring (rolling) and always end with a cool-down. We incorporate games and fun activities, especially for younger students.",
      },
      {
        question: 'Can my child attend classes at different locations?',
        answer:
          'Students are enrolled at specific locations based on their daycare. However, if circumstances change (moving, changing daycares), we can help transfer enrollment to another location where available.',
      },
      {
        question: 'What if my child misses a class?',
        answer:
          "Life happens! There are no penalties for missed classes. Students can pick up right where they left off. Our curriculum is structured so children can progress at their own pace.",
      },
    ],
  },
  {
    name: 'Safety & Supervision',
    questions: [
      {
        question: 'Is BJJ safe for young children?',
        answer:
          'Yes! BJJ is one of the safest martial arts for children because it emphasizes control and technique over striking. Our instructors are specifically trained for youth instruction, and all activities are age-appropriate. We maintain low student-to-instructor ratios for close supervision.',
      },
      {
        question: 'What are your instructor qualifications?',
        answer:
          'All Little Grapplers instructors are: minimum purple belt in BJJ, background checked and verified, CPR and First Aid certified, and trained in child development. We have strict hiring standards to ensure the best instruction for your child.',
      },
      {
        question: 'How do you handle discipline and behavior issues?',
        answer:
          'We use positive reinforcement and clear expectations. The structure of BJJ naturally teaches discipline through practice. For persistent issues, we communicate with parents to address concerns collaboratively.',
      },
      {
        question: 'What safety equipment is used?',
        answer:
          "We use high-quality grappling mats designed to cushion falls. No striking or headgear is needed since BJJ doesn't involve hitting. Mouthguards are optional but recommended for older students who spar.",
      },
    ],
  },
  {
    name: 'Belt System & Progress',
    questions: [
      {
        question: 'How does the belt system work for kids?',
        answer:
          'Youth BJJ uses a different belt system than adults, following IBJJF guidelines. Kids progress through White, Grey (3 variations), Yellow (3 variations), Orange (3 variations), and Green (3 variations) belts. Within each belt, students can earn up to 4 stripes before the next promotion.',
      },
      {
        question: 'How often are belt promotions?',
        answer:
          "Promotions depend on individual progress, not a set timeline. Students must demonstrate proficiency in techniques, consistent attendance, and the character values we emphasize. Most students can expect stripe promotions every 2-4 months with regular attendance.",
      },
      {
        question: 'Is there a formal testing or graduation?',
        answer:
          "We do recognize promotions with small ceremonies to celebrate each student's achievement. Parents are notified in advance and are welcome to attend when possible.",
      },
      {
        question: 'What happens when my child turns 16?',
        answer:
          'At 16, students transition to the adult belt system. Time spent training as a youth counts toward their journey. A green belt holder with years of experience might transition to a high-level blue or even purple belt after evaluation.',
      },
    ],
  },
  {
    name: 'Pricing & Policies',
    questions: [
      {
        question: 'How much does the program cost?',
        answer:
          'Pricing varies by location and program. Typically, monthly tuition ranges from $99-$179 per month depending on the program and class frequency. Contact us or check your specific location for exact pricing.',
      },
      {
        question: 'Are there sibling discounts?',
        answer:
          'Yes! We offer discounts for families with multiple children enrolled. Contact us for details on our family pricing.',
      },
      {
        question: 'What is your cancellation policy?',
        answer:
          'We require 30 days notice to cancel enrollment. There are no long-term contracts—you can cancel at any time with proper notice. Pausing enrollment temporarily is also possible for vacations or other circumstances.',
      },
      {
        question: 'Is there a trial period?',
        answer:
          "We offer trial classes at most locations so your child can experience BJJ before committing. Contact us to schedule a trial.",
      },
    ],
  },
];

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
