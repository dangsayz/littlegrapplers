import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Age-appropriate Brazilian Jiu-Jitsu programs for children ages 3-12, designed to build confidence, discipline, and physical fitness.',
};

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
    image: '/images/highlights/bjjlittlegrapplers2-8.jpg',
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
    image: '/images/highlights/bjjlittlegrapplers2-9.jpg',
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

export default function ProgramsPage() {
  return (
    <div className="bg-foreground text-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-32">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-background/40 mb-6">
              Age-Appropriate Training
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black leading-[0.9] tracking-tight">
              Programs for Every<br />
              <span className="font-serif italic font-normal text-brand">Young Grappler.</span>
            </h1>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto leading-relaxed">
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
                    <p className="mt-6 text-lg text-background/60 leading-relaxed">{program.description}</p>

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
                          <span className="text-background/70">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-2 text-sm text-background/50">
                      <Clock className="h-4 w-4" />
                      <span>{program.schedule}</span>
                    </div>

                    <div className="mt-8">
                      <Button variant="brand" asChild>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
              Curriculum
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black">
              What They'll <span className="font-serif italic font-normal text-brand">Learn</span>
            </h2>
            <p className="mt-6 text-lg text-background/60">
              Our comprehensive curriculum covers all aspects of youth BJJ development.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {curriculum.map((item) => (
              <StaggerItem key={item.title}>
                <div className="rounded-lg border border-background/10 bg-background/5 p-6 h-full">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-background/60">{item.description}</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">
                Progression
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
                Belt <span className="font-serif italic font-normal text-brand">System</span>
              </h2>
              <div className="mt-8 space-y-6 text-lg text-background/60 leading-relaxed">
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
                <Button variant="outline" className="border-background/20 text-background hover:bg-background hover:text-foreground" asChild>
                  <Link href="/benefits">
                    Learn About Benefits
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                {[
                  { name: 'White Belt', color: 'bg-white', stripes: '0-4 stripes' },
                  { name: 'Grey Belt', color: 'bg-gray-400', stripes: '0-4 stripes per stage' },
                  { name: 'Yellow Belt', color: 'bg-yellow-400', stripes: '0-4 stripes per stage' },
                  { name: 'Orange Belt', color: 'bg-orange-500', stripes: '0-4 stripes per stage' },
                  { name: 'Green Belt', color: 'bg-green-500', stripes: '0-4 stripes per stage' },
                ].map((belt) => (
                  <StaggerItem key={belt.name}>
                    <div className="flex items-center gap-4 rounded-lg border border-background/10 bg-background/5 p-4">
                      <div className={`h-6 w-16 rounded ${belt.color}`} />
                      <div>
                        <div className="font-medium text-background">{belt.name}</div>
                        <div className="text-sm text-background/50">{belt.stripes}</div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeIn>
          </div>
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
              Find a Program <span className="font-serif italic font-normal text-brand">Near You</span>
            </h2>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto">
              We partner with quality daycare facilities across the region. Find a location that
              works for your family.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="brand" asChild>
                <Link href="/locations">
                  View Locations
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-background/20 text-background hover:bg-background hover:text-foreground"
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
