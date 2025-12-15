import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';

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
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Programs for Every
              <br />
              <span className="text-brand">Young Grappler</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Age-appropriate curriculum designed by child development experts and experienced BJJ
              instructors. Every class is structured to be safe, engaging, and effective.
            </p>
          </div>
        </Container>
      </section>

      {/* Programs List */}
      <section className="section-padding">
        <Container>
          <div className="space-y-24">
            {programs.map((program, index) => (
              <div
                key={program.name}
                className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${
                  index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
                    {program.ageRange}
                  </div>
                  <h2 className="mt-4 text-display-sm font-display font-bold">{program.name}</h2>
                  <p className="mt-4 text-lg text-muted-foreground">{program.description}</p>

                  <ul className="mt-6 space-y-3">
                    {program.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                          <svg
                            className="h-3 w-3 text-green-500"
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
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{program.schedule}</span>
                  </div>

                  <div className="mt-8">
                    <Button asChild>
                      <Link href="/locations">
                        Find a Location
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={program.image}
                    alt={`${program.name} class in action`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Curriculum Overview */}
      <section className="section-padding bg-foreground text-background">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">What They'll Learn</h2>
            <p className="mt-4 text-lg text-background/70">
              Our comprehensive curriculum covers all aspects of youth BJJ development.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-background/10 bg-background/5 p-6"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-background/70">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Belt System */}
      <section className="section-padding">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-display-sm font-display font-bold">Belt Progression System</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our structured belt system gives students clear goals and a sense of accomplishment
                as they progress. Following IBJJF youth belt guidelines, students earn stripes and
                belts through demonstrated skill and character development.
              </p>
              <p className="mt-4 text-muted-foreground">
                Each belt level has specific requirements covering techniques, sparring ability, and
                the core values of discipline, respect, and perseverance. Belt promotions are
                celebrated as significant milestones in each student's martial arts journey.
              </p>
              <div className="mt-8">
                <Button variant="outline" asChild>
                  <Link href="/benefits">
                    Learn About Benefits
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'White Belt', color: 'bg-white border', stripes: '0-4 stripes' },
                { name: 'Grey Belt', color: 'bg-gray-400', stripes: '0-4 stripes per stage' },
                { name: 'Yellow Belt', color: 'bg-yellow-400', stripes: '0-4 stripes per stage' },
                { name: 'Orange Belt', color: 'bg-orange-500', stripes: '0-4 stripes per stage' },
                { name: 'Green Belt', color: 'bg-green-500', stripes: '0-4 stripes per stage' },
              ].map((belt) => (
                <div key={belt.name} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                  <div className={`h-6 w-16 rounded ${belt.color}`} />
                  <div>
                    <div className="font-medium">{belt.name}</div>
                    <div className="text-sm text-muted-foreground">{belt.stripes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="rounded-2xl bg-foreground p-8 text-center text-background md:p-16">
            <h2 className="text-display-sm font-display font-bold">Find a Program Near You</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
              We partner with quality daycare facilities across the region. Find a location that
              works for your family.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="brand" asChild>
                <Link href="/locations">
                  View Locations
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
