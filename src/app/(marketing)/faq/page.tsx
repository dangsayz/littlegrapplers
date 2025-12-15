'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { cn } from '@/lib/utils';

const faqCategories = [
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

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Frequently Asked
              <br />
              <span className="text-brand">Questions</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Everything you need to know about Little Grapplers. Can't find what you're looking
              for? Reach out to our team.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Accordion */}
      <section className="section-padding">
        <Container>
          <div className="mx-auto max-w-3xl">
            {faqCategories.map((category) => (
              <div key={category.name} className="mb-12">
                <h2 className="mb-6 text-xl font-semibold">{category.name}</h2>
                <div className="space-y-3">
                  {category.questions.map((item, index) => {
                    const itemId = `${category.name}-${index}`;
                    const isOpen = openItems[itemId];

                    return (
                      <div
                        key={itemId}
                        className="overflow-hidden rounded-lg border bg-card"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
                          aria-expanded={isOpen}
                        >
                          <span className="font-medium pr-4">{item.question}</span>
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
                            <div className="border-t px-6 py-4 text-muted-foreground">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Still have questions */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-foreground p-8 text-center text-background md:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
                <HelpCircle className="h-8 w-8 text-brand" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">Still Have Questions?</h2>
              <p className="mx-auto mt-3 max-w-md text-background/70">
                We're here to help! Reach out to our team and we'll get back to you within 24
                hours.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="brand" asChild>
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background/30 text-background hover:bg-background/10"
                  asChild
                >
                  <Link href="/locations">Find a Location</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
