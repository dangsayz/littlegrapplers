import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Heart,
  Shield,
  Target,
  Users,
  Zap,
  Award,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Benefits',
  description:
    'Discover how Brazilian Jiu-Jitsu builds confidence, discipline, and physical fitness in children through our specialized youth programs.',
};

const physicalBenefits = [
  {
    icon: Zap,
    title: 'Improved Coordination',
    description:
      'BJJ develops fine and gross motor skills through complex movement patterns and techniques.',
  },
  {
    icon: Heart,
    title: 'Cardiovascular Health',
    description:
      'Active training sessions improve heart health and build endurance in a fun, engaging way.',
  },
  {
    icon: Target,
    title: 'Strength & Flexibility',
    description:
      'Functional movements build real-world strength while improving overall flexibility.',
  },
];

const mentalBenefits = [
  {
    icon: Brain,
    title: 'Problem-Solving Skills',
    description:
      'Often called "human chess," BJJ teaches children to think critically and adapt strategies.',
  },
  {
    icon: Shield,
    title: 'Confidence & Self-Esteem',
    description:
      'Mastering techniques and earning belts builds genuine, earned confidence.',
  },
  {
    icon: Award,
    title: 'Discipline & Focus',
    description:
      'Structured classes and progressive curriculum develop concentration and self-control.',
  },
];

const socialBenefits = [
  {
    icon: Users,
    title: 'Teamwork & Cooperation',
    description:
      'Training with partners teaches children to work together and support one another.',
  },
  {
    icon: Smile,
    title: 'Respect & Sportsmanship',
    description:
      'The culture of BJJ emphasizes respect for instructors, training partners, and opponents.',
  },
  {
    icon: Shield,
    title: 'Anti-Bullying Skills',
    description:
      'Children learn to handle confrontation calmly and de-escalate situations safely.',
  },
];

const testimonials = [
  {
    quote:
      "My son was shy and struggled with confidence. After just a few months in Little Grapplers, he's a different kid. He walks taller, speaks up more, and has made wonderful friends.",
    author: 'Sarah M.',
    role: 'Parent of 5-year-old',
  },
  {
    quote:
      "The discipline and focus she's developed in BJJ has carried over to everything—homework, chores, even listening better at home. It's been transformative.",
    author: 'Michael D.',
    role: 'Parent of 7-year-old',
  },
  {
    quote:
      "We love that it's at his daycare. No rushing after work, no weekend commitments. He gets martial arts training as part of his regular day.",
    author: 'Jennifer K.',
    role: 'Parent of 4-year-old',
  },
];

export default function BenefitsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Benefits That Last
              <br />
              <span className="text-brand">A Lifetime</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Brazilian Jiu-Jitsu offers children far more than physical fitness. It's a complete
              developmental system that builds character, confidence, and capability.
            </p>
          </div>
        </Container>
      </section>

      {/* Physical Benefits */}
      <section className="section-padding">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/highlights/bjjlittlegrapplers2-10.jpg"
                alt="Children developing physical skills through BJJ"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
                Physical Development
              </div>
              <h2 className="mt-4 text-display-sm font-display font-bold">
                Build a Strong Foundation
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                BJJ training develops physical capabilities that benefit children in all areas of
                life, from sports to everyday activities.
              </p>
              <div className="mt-8 space-y-6">
                {physicalBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mental Benefits */}
      <section className="section-padding bg-foreground text-background">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-11.jpg"
                  alt="Child focused during BJJ training"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:order-1">
              <div className="inline-block rounded-full bg-brand/20 px-4 py-1.5 text-sm font-medium text-brand">
                Mental Development
              </div>
              <h2 className="mt-4 text-display-sm font-display font-bold">
                Sharpen the Mind
              </h2>
              <p className="mt-4 text-lg text-background/70">
                The mental challenges of BJJ translate directly to academic success and life skills.
              </p>
              <div className="mt-8 space-y-6">
                {mentalBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/10">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-background/70">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Social Benefits */}
      <section className="section-padding">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/highlights/bjjlittlegrapplers2-12.jpg"
                alt="Children training together in BJJ"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
                Social Development
              </div>
              <h2 className="mt-4 text-display-sm font-display font-bold">
                Learn to Work Together
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                The unique partner-based nature of BJJ naturally develops important social skills.
              </p>
              <div className="mt-8 space-y-6">
                {socialBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Self-Defense Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">Real Self-Defense Skills</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              While we hope they never need it, children gain practical skills to protect themselves.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Escape Skills',
                description:
                  'Learn to break grips, escape holds, and get away from larger attackers safely.',
              },
              {
                title: 'Non-Violent Solutions',
                description:
                  'BJJ emphasizes control and de-escalation over striking or causing harm.',
              },
              {
                title: 'Situational Awareness',
                description:
                  'Training develops awareness of surroundings and potential threats.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">What Parents Say</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real stories from real families in our program.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="rounded-xl border bg-card p-6">
                <svg
                  className="h-8 w-8 text-brand/30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="mt-4 text-muted-foreground">{testimonial.quote}</p>
                <div className="mt-6 border-t pt-4">
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="rounded-2xl bg-foreground p-8 text-center text-background md:p-16">
            <h2 className="text-display-sm font-display font-bold">Ready to Get Started?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
              Give your child the gift of confidence, discipline, and self-defense skills. Find a
              location near you and enroll today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="brand" asChild>
                <Link href="/locations">
                  Find a Location
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10"
                asChild
              >
                <Link href="/programs">View Programs</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
