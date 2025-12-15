import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, Heart, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Little Grapplers mission to bring Brazilian Jiu-Jitsu to children at daycare facilities across the region.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-display-lg font-display font-bold">
              Building Tomorrow's
              <br />
              <span className="text-brand">Leaders Today</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Little Grapplers was founded on a simple belief: every child deserves access to the
              transformative power of martial arts, delivered in a safe and convenient environment.
            </p>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-display-sm font-display font-bold">Our Mission</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We partner with daycare facilities to bring world-class Brazilian Jiu-Jitsu
                instruction directly to children during their day. No extra driving. No scheduling
                conflicts. Just martial arts excellence, integrated seamlessly into your child's
                routine.
              </p>
              <p className="mt-4 text-muted-foreground">
                Our curriculum is specifically designed for young learners, focusing on fundamental
                movement patterns, basic self-defense concepts, and the core values of discipline,
                respect, and perseverance.
              </p>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/programs">
                    Explore Programs
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/highlights/bjjlittlegrapplers2-7.jpg"
                alt="Kids in BJJ training session"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-foreground text-background">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">Our Core Values</h2>
            <p className="mt-4 text-lg text-background/70">
              Everything we do is guided by these principles.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: 'Safety First',
                description:
                  'Every technique, drill, and activity is designed with child safety as the top priority.',
              },
              {
                icon: Heart,
                title: 'Genuine Care',
                description:
                  'Our instructors are passionate about child development and invested in each student.',
              },
              {
                icon: Target,
                title: 'Excellence',
                description:
                  'We hold ourselves to the highest standards in curriculum, instruction, and operations.',
              },
              {
                icon: Award,
                title: 'Integrity',
                description:
                  'We do what we say. Parents can trust us with their most precious responsibility.',
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
                  <value.icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-background/70">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why BJJ Section */}
      <section className="section-padding">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">Why Brazilian Jiu-Jitsu?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Of all the martial arts, we chose BJJ for specific reasons.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Non-Violent Defense',
                description:
                  'BJJ emphasizes control and submission over striking. Children learn to neutralize threats without causing unnecessary harm.',
              },
              {
                title: 'Physical Chess',
                description:
                  'Often called "human chess," BJJ develops problem-solving skills and strategic thinking alongside physical fitness.',
              },
              {
                title: 'Confidence Through Competence',
                description:
                  'Knowing how to handle physical confrontation builds genuine confidence that transcends the mat.',
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

      {/* Team Section */}
      <section className="section-padding bg-muted/30">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-sm font-display font-bold">Our Instructors</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every Little Grapplers instructor meets our rigorous standards.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              'Background checked and verified',
              'CPR and First Aid certified',
              'Minimum purple belt in BJJ',
              'Child development training',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border bg-background p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <Container>
          <div className="rounded-2xl bg-foreground p-8 text-center text-background md:p-16">
            <h2 className="text-display-sm font-display font-bold">Ready to Learn More?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
              Contact us to find out if there's a Little Grapplers program at your child's
              daycare, or to inquire about starting one.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="brand" asChild>
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10"
                asChild
              >
                <Link href="/locations">View Locations</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
