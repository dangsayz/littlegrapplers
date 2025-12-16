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
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

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
    <div className="bg-foreground text-background overflow-hidden dark">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground dark:from-brand/40 dark:via-foreground dark:to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-background/40 mb-6">
              Why BJJ?
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black leading-[0.9] tracking-tight">
              Benefits That Last<br />
              <span className="font-serif italic font-normal text-brand">A Lifetime.</span>
            </h1>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto leading-relaxed">
              Brazilian Jiu-Jitsu offers children far more than physical fitness. It's a complete
              developmental system that builds character, confidence, and capability.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Physical Benefits */}
      <section className="py-32 md:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <FadeIn direction="up">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-10.jpg"
                  alt="Children developing physical skills through BJJ"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }} />
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
                Physical Development
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Build a Strong <span className="font-serif italic font-normal text-brand">Foundation</span>
              </h2>
              <p className="mt-6 text-lg text-background/60 leading-relaxed">
                BJJ training develops physical capabilities that benefit children in all areas of
                life, from sports to everyday activities.
              </p>
              <div className="mt-8 space-y-6">
                {physicalBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/10">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-background">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-background/60">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Mental Benefits */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <FadeIn direction="up" delay={0.2} className="lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-11.jpg"
                  alt="Child focused during BJJ training"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }} />
              </div>
            </FadeIn>
            <FadeIn direction="up" className="lg:order-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-6">
                Mental Development
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Sharpen the <span className="font-serif italic font-normal text-brand">Mind</span>
              </h2>
              <p className="mt-6 text-lg text-background/60 leading-relaxed">
                The mental challenges of BJJ translate directly to academic success and life skills.
              </p>
              <div className="mt-8 space-y-6">
                {mentalBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/10">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-background">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-background/60">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Social Benefits */}
      <section className="py-32 md:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <FadeIn direction="up">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-12.jpg"
                  alt="Children training together in BJJ"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }} />
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
                Social Development
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Learn to Work <span className="font-serif italic font-normal text-brand">Together</span>
              </h2>
              <p className="mt-6 text-lg text-background/60 leading-relaxed">
                The unique partner-based nature of BJJ naturally develops important social skills.
              </p>
              <div className="mt-8 space-y-6">
                {socialBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background/10">
                      <benefit.icon className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-background">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-background/60">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Self-Defense Section */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
              Self-Defense
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black">
              Real Self-Defense <span className="font-serif italic font-normal text-brand">Skills</span>
            </h2>
            <p className="mt-6 text-lg text-background/60">
              While we hope they never need it, children gain practical skills to protect themselves.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
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
              <StaggerItem key={item.title}>
                <div className="rounded-lg border border-background/10 bg-background/5 p-6 h-full">
                  <h3 className="text-lg font-semibold text-background">{item.title}</h3>
                  <p className="mt-2 text-background/60">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-32 md:py-40">
        <Container>
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black">
              What Parents <span className="font-serif italic font-normal text-brand">Say</span>
            </h2>
            <p className="mt-6 text-lg text-background/60">
              Real stories from real families in our program.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-3" staggerDelay={0.1}>
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <div className="rounded-lg border border-background/10 bg-background/5 p-6 h-full">
                  <svg
                    className="h-8 w-8 text-brand/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="mt-4 text-background/70">{testimonial.quote}</p>
                  <div className="mt-6 border-t border-background/10 pt-4">
                    <div className="font-medium text-background">{testimonial.author}</div>
                    <div className="text-sm text-background/50">{testimonial.role}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-[#0a0f1a]" />
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
              Get Started
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              Ready to Get <span className="font-serif italic font-normal text-brand">Started?</span>
            </h2>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto">
              Give your child the gift of confidence, discipline, and self-defense skills. Find a
              location near you and enroll today.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="brand" asChild>
                <Link href="/locations">
                  Find a Location
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-background/20 text-background hover:bg-background hover:text-foreground"
                asChild
              >
                <Link href="/programs">View Programs</Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
