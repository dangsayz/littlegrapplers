'use client';

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
import { motion } from 'framer-motion';


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
    <div className="bg-[#F7F9F9] text-[#1F2A44] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-[#F7F9F9] to-[#F7F9F9]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-8">
              Why BJJ?
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight text-slate-800">
              Benefits That Last
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">A Lifetime.</span>
            </h1>
            <p className="mt-8 text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
              Brazilian Jiu-Jitsu offers children far more than physical fitness. It's a complete
              developmental system that builds character, confidence, and capability.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Leading By Example Section - Coach Stephen */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/10 via-transparent to-[#F7931E]/10" />
        
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <FadeIn direction="up">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Image
                    src="/images/competition/IMG_6155.jpg"
                    alt="Coach Stephen competing at ADCC"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div 
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl mt-8"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Image
                    src="/images/competition/IMG_6152.jpeg"
                    alt="Coach Stephen on the competition mats"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-wider mb-6">
                Meet Your Coach
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Learn from an{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF]">Active Competitor</span>
              </h2>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Coach Stephen doesn't just teach BJJ—he lives it. As an active competitor on the professional circuit, 
                he brings real-world experience and current techniques directly to your children.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Competition Tested</h3>
                    <p className="mt-1 text-sm text-slate-400">Techniques refined through real competition experience</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7931E] to-[#FFC857] shadow-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Current & Relevant</h3>
                    <p className="mt-1 text-sm text-slate-400">Always learning and bringing the latest to your kids</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Physical Benefits */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <FadeIn direction="up">
              <motion.div 
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/80 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-10.jpg"
                  alt="Children developing physical skills through BJJ"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10" />
              </motion.div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-6">
                Physical Development
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-800">
                Build a Strong{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Foundation</span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                BJJ training develops physical capabilities that benefit children in all areas of
                life, from sports to everyday activities.
              </p>
              <div className="mt-8 space-y-4">
                {physicalBenefits.map((benefit) => (
                  <motion.div 
                    key={benefit.title} 
                    className="flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Mental Benefits */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <FadeIn direction="up" delay={0.2} className="lg:order-2">
              <motion.div 
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/80 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-11.jpg"
                  alt="Child focused during BJJ training"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10" />
              </motion.div>
            </FadeIn>
            <FadeIn direction="up" className="lg:order-1">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-6">
                Mental Development
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-800">
                Sharpen the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Mind</span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                The mental challenges of BJJ translate directly to academic success and life skills.
              </p>
              <div className="mt-8 space-y-4">
                {mentalBenefits.map((benefit) => (
                  <motion.div 
                    key={benefit.title} 
                    className="flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Social Benefits */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <FadeIn direction="up">
              <motion.div 
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/80 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-12.jpg"
                  alt="Children training together in BJJ"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10" />
              </motion.div>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-6">
                Social Development
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-800">
                Learn to Work{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Together</span>
              </h2>
              <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                The unique partner-based nature of BJJ naturally develops important social skills.
              </p>
              <div className="mt-8 space-y-4">
                {socialBenefits.map((benefit) => (
                  <motion.div 
                    key={benefit.title} 
                    className="flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Self-Defense Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-white" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-semibold uppercase tracking-wider mb-6">
              Self-Defense
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">
              Real Self-Defense{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-500">Skills</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              While we hope they never need it, children gain practical skills to protect themselves.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
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
                <motion.div 
                  className="relative h-full rounded-[24px] overflow-hidden"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50/50 to-white" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-[24px] border border-white/80 pointer-events-none" />
                  <div className="absolute inset-[1px] rounded-[23px] border border-slate-200/40 pointer-events-none" />
                  <div className="relative z-10 p-6 h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg mb-5">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50">
        <Container>
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-6">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">
              What Parents{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">Say</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Real stories from real families in our program.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <motion.div 
                  className="relative h-full rounded-[24px] overflow-hidden"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/50 to-white" />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 rounded-[24px] border border-white/80 pointer-events-none" />
                  <div className="absolute inset-[1px] rounded-[23px] border border-slate-200/40 pointer-events-none" />
                  <div className="relative z-10 p-6 h-full flex flex-col">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg mb-4">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">{testimonial.quote}</p>
                    <div className="mt-6 pt-4 border-t border-slate-200/60">
                      <div className="font-semibold text-slate-800">{testimonial.author}</div>
                      <div className="text-xs text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-emerald-500/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-400/30 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-wider mb-8">
              Get Started
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Ready to Get{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Started?</span>
            </h2>
            <p className="mt-8 text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
              Give your child the gift of confidence, discipline, and self-defense skills. Find a
              location near you and enroll today.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white h-12 px-8 shadow-lg" asChild>
                <Link href="/locations">
                  Find a Location
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-12 px-8 backdrop-blur-sm"
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
