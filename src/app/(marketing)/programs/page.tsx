'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// export const metadata: Metadata = {
//   title: 'Programs',
//   description:
//     'Age-appropriate Brazilian Jiu-Jitsu programs for children ages 3-12, designed to build confidence, discipline, and physical fitness.',
// };

const programs = [
  {
    name: 'Tiny Grapplers',
    ageRange: 'Ages 3-5',
    description:
      'An introduction to movement and martial arts fundamentals. Through games and structured play, children develop body awareness, coordination, and basic self-defense concepts.',
    highlights: [
      'Movement games and coordination drills',
      'Basic balance and body control',
      'Introduction to gentle techniques',
      'Fun partner activities',
      'Character development focus',
    ],
    schedule: '30-45 minute classes, 2-3x per week',
    image: '/images/highlights/bjjlittlegrapplers2-7.jpg',
  },
  {
    name: 'Junior Grapplers',
    ageRange: 'Ages 6-8',
    description:
      'Building on fundamental movement skills, Junior Grapplers begin learning real BJJ techniques. Classes focus on positions, escapes, and controlled sparring in a supportive environment.',
    highlights: [
      'Fundamental positions and escapes',
      'Age-appropriate submissions',
      'Light positional sparring',
      'Self-defense scenarios',
      'Belt progression system',
    ],
    schedule: '45-minute classes, 2-3x per week',
    image: '/images/highlights/bjjlittlegrapplers2-2.jpg',
  },
  {
    name: 'Advanced Grapplers',
    ageRange: 'Ages 9-12',
    description:
      'For students ready to take their training to the next level. Advanced Grapplers work on more complex techniques, competition preparation, and develop leadership skills.',
    highlights: [
      'Advanced technique combinations',
      'Competition preparation (optional)',
      'Live sparring sessions',
      'Leadership and mentoring opportunities',
      'Comprehensive belt curriculum',
    ],
    schedule: '60-minute classes, 2-3x per week',
    image: '/images/highlights/bjjlittlegrapplers2-16.jpg',
  },
];

const curriculum = [
  {
    title: 'Foundational Movement',
    description: 'Shrimping, bridging, rolling, and other essential BJJ movements that build body awareness.',
  },
  {
    title: 'Position & Control',
    description: 'Mount, side control, guard, and back control positions taught progressively.',
  },
  {
    title: 'Escapes & Reversals',
    description: 'How to safely escape from bottom positions and regain control.',
  },
  {
    title: 'Age-Appropriate Submissions',
    description: 'Joint locks and chokes taught with emphasis on safety and control.',
  },
  {
    title: 'Self-Defense Scenarios',
    description: 'Practical applications including anti-bullying techniques and stranger awareness.',
  },
  {
    title: 'Character Development',
    description: 'Discipline, respect, perseverance, and sportsmanship woven into every class.',
  },
];

const belts = [
  { name: 'White Belt', gradient: 'from-gray-50 to-white', border: 'border-gray-200', stripes: '0-4 stripes', shadow: 'shadow-gray-200/50' },
  { name: 'Grey Belt', gradient: 'from-gray-400 to-gray-500', border: 'border-gray-400', stripes: '0-4 stripes per stage', shadow: 'shadow-gray-400/30' },
  { name: 'Yellow Belt', gradient: 'from-yellow-300 to-yellow-400', border: 'border-yellow-400', stripes: '0-4 stripes per stage', shadow: 'shadow-yellow-400/30' },
  { name: 'Orange Belt', gradient: 'from-orange-400 to-orange-500', border: 'border-orange-500', stripes: '0-4 stripes per stage', shadow: 'shadow-orange-400/30' },
  { name: 'Green Belt', gradient: 'from-green-400 to-green-500', border: 'border-green-500', stripes: '0-4 stripes per stage', shadow: 'shadow-green-400/30' },
];

function BeltSystemVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <div ref={containerRef} className="space-y-3">
      {belts.map((belt, index) => (
        <motion.div
          key={belt.name}
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{
            duration: 0.6,
            delay: index * 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            className={`group relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white border border-[#1F2A44]/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#1F2A44]/[0.1] transition-all duration-500 ease-out cursor-default active:scale-[0.98]`}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Belt visual */}
            <div className="relative h-6 sm:h-7 w-16 sm:w-20 rounded-md overflow-hidden">
              {/* Background track */}
              <div className={`absolute inset-0 bg-gradient-to-r ${belt.gradient} opacity-20`} />
              
              {/* Animated fill */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${belt.gradient} rounded-md ${belt.shadow} shadow-lg`}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: 'left' }}
              />
              
              {/* Stripe indicators */}
              <div className="absolute inset-y-0 right-1 flex items-center gap-[2px]">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] h-3 bg-white/60 rounded-full"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={isInView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.6 + index * 0.12 + i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Belt info */}
            <div className="flex-1">
              <motion.div
                className="text-[15px] font-semibold text-[#1F2A44] tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {belt.name}
              </motion.div>
              <motion.div
                className="text-[13px] text-[#1F2A44]/40 mt-0.5"
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  duration: 0.5,
                  delay: 0.45 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {belt.stripes}
              </motion.div>
            </div>

            {/* Subtle progress indicator */}
            <motion.div
              className="text-xs font-medium text-[#1F2A44]/20 tabular-nums"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.12 }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <div className="bg-[#F7F9F9] text-[#1F2A44] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-32">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/10 via-white to-[#F7F9F9]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1F2A44]/40 mb-6">
              Age-Appropriate Training
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black leading-tight tracking-tight">
              <span className="block overflow-visible pb-2">
                <span className="inline-block opacity-0 animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards]">Programs</span>{' '}
                <span className="inline-block opacity-0 animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_0.4s_forwards]">for</span>{' '}
                <span className="inline-block opacity-0 animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_0.6s_forwards]">Every</span>
              </span>
              <span className="block overflow-visible pb-4">
                <span className="inline-block font-serif italic font-normal text-brand opacity-0 animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_0.9s_forwards]">Young</span>{' '}
                <span className="inline-block font-serif italic font-normal text-brand opacity-0 animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_1.1s_forwards]">Grappler.</span>
              </span>
            </h1>
            <p className="mt-8 text-xl text-[#1F2A44]/60 max-w-xl mx-auto leading-relaxed">
              Age-appropriate curriculum designed by child development experts and experienced BJJ
              instructors. Every class is structured to be safe, engaging, and effective.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Programs List */}
      <section className="py-32 md:py-40">
        <Container>
          <div className="space-y-32">
            {programs.map((program, index) => (
              <FadeIn key={program.name} direction="up">
                <div
                  className={`grid gap-12 lg:grid-cols-2 lg:gap-24 items-center ${
                    index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="inline-block rounded-full bg-brand/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-brand">
                      {program.ageRange}
                    </div>
                    <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                      {program.name.split(' ')[0]}{' '}
                      <span className="font-serif italic font-normal text-brand">{program.name.split(' ')[1]}</span>
                    </h2>
                    <p className="mt-6 text-lg text-[#1F2A44]/60 leading-relaxed">{program.description}</p>

                    <ul className="mt-8 space-y-4">
                      {program.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20">
                            <svg
                              className="h-3 w-3 text-brand"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-[#1F2A44]/70">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-2 text-sm text-[#1F2A44]/50">
                      <Clock className="h-4 w-4" />
                      <span>{program.schedule}</span>
                    </div>

                    <div className="mt-8">
                      <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
                        <Link href="/locations">
                          Find a Location
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={program.image}
                      alt={`${program.name} class in action`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                    }} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Curriculum Overview */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/10 via-white to-[#F7F9F9]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2A44]/40 mb-6">
              Curriculum
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black">
              What They'll <span className="font-serif italic font-normal text-brand">Learn</span>
            </h2>
            <p className="mt-6 text-lg text-[#1F2A44]/60">
              Our comprehensive curriculum covers all aspects of youth BJJ development.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {curriculum.map((item) => (
              <StaggerItem key={item.title}>
                <div className="rounded-lg border border-[#1F2A44]/10 bg-white shadow-sm p-6 h-full">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#1F2A44]/60">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Belt System */}
      <section className="py-32 md:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <FadeIn direction="up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2A44]/40 mb-6">
                Progression
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Belt <span className="font-serif italic font-normal text-brand">System</span>
              </h2>
              <div className="mt-8 space-y-6 text-lg text-[#1F2A44]/60 leading-relaxed">
                <p>
                  Our structured belt system gives students clear goals and a sense of accomplishment
                  as they progress. Following IBJJF youth belt guidelines, students earn stripes and
                  belts through demonstrated skill and character development.
                </p>
                <p>
                  Each belt level has specific requirements covering techniques, sparring ability, and
                  the core values of discipline, respect, and perseverance. Belt promotions are
                  celebrated as significant milestones in each student's martial arts journey.
                </p>
              </div>
              <div className="mt-8">
                <Button variant="outline" className="border-[#1F2A44]/20 text-[#1F2A44] hover:bg-[#1F2A44] hover:text-white" asChild>
                  <Link href="/benefits">
                    Learn About Benefits
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <BeltSystemVisual />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F9F9] via-white to-[#F7F9F9]" />
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2A44]/40 mb-6">
              Get Started
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              Find a Program <span className="font-serif italic font-normal text-brand">Near You</span>
            </h2>
            <p className="mt-8 text-xl text-[#1F2A44]/60 max-w-xl mx-auto">
              We partner with quality daycare facilities across the region. Find a location that
              works for your family.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-brand hover:bg-brand/90 text-white h-12 px-8" asChild>
                <Link href="/locations">
                  View Locations
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#1F2A44]/20 text-[#1F2A44] hover:bg-[#1F2A44] hover:text-white h-12 px-8"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
