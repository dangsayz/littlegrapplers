import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Find a Little Grapplers Brazilian Jiu-Jitsu program at a daycare facility near you in Dallas.',
};

// 3 Dallas-area locations
const locations = [
  {
    id: '1',
    name: 'Sunshine Daycare',
    area: 'North Dallas',
    address: '4521 Preston Rd, Dallas, TX 75205',
    image: '/images/highlights/bjjlittlegrapplers2-1.jpg',
  },
  {
    id: '2',
    name: 'Happy Kids Learning Center',
    area: 'Plano',
    address: '2100 W Parker Rd, Plano, TX 75023',
    image: '/images/highlights/bjjlittlegrapplers2-2.jpg',
  },
  {
    id: '3',
    name: 'Little Learners Academy',
    area: 'Richardson',
    address: '850 W Arapaho Rd, Richardson, TX 75080',
    image: '/images/highlights/bjjlittlegrapplers2-3.jpg',
  },
];

export default function LocationsPage() {
  return (
    <div className="bg-foreground text-background">
      {/* Hero */}
      <section className="py-32 md:py-40">
        <Container>
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">Partner Locations</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              Find a location <span className="font-serif italic font-normal text-brand">near you.</span>
            </h1>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto">
              We partner with quality daycare facilities across Dallas to bring BJJ instruction directly to your child.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Locations - 3 column grid */}
      <section className="pb-32">
        <Container>
          <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {locations.map((location) => (
              <StaggerItem key={location.id}>
                <div className="group relative overflow-hidden rounded-sm bg-background/5 hover:bg-background/10 transition-colors duration-300">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={location.image}
                      alt={location.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                    
                    {/* Area badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-brand text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {location.area}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3">{location.name}</h2>
                    <div className="flex items-start gap-2 text-background/50 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-6 w-full border-background/20 text-background hover:bg-background/10" asChild>
                      <Link href="/inquiry">
                        Enroll Here
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Don't see your area CTA */}
      <section className="py-32">
        <Container>
          <FadeIn direction="up" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-black">
              Don't see your <span className="font-serif italic font-normal text-brand">area?</span>
            </h2>
            <p className="mt-6 text-lg text-background/60">
              We're expanding across Dallas! Let us know your daycare and we'll work to bring Little Grapplers there.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="brand" asChild>
                <Link href="/inquiry">
                  Request a Location
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-background/20 text-background hover:bg-background/10" asChild>
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
