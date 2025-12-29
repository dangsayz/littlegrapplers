import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'About - Coach Stephen',
  description:
    'Meet Coach Stephen, a passionate BJJ brown belt dedicated to introducing children to Brazilian Jiu-Jitsu fundamentals.',
};

const stats = [
  { value: '10+', label: 'Years Training BJJ' },
  { value: '500+', label: 'Kids Coached' },
  { value: '3', label: 'Partner Locations' },
  { value: '100%', label: 'Passion' },
];

const galleryImages = [
  '/images/highlights/LittleGrapplers-05873.jpg',
  '/images/highlights/LittleGrapplers-05919.jpg',
  '/images/highlights/LittleGrapplers-05924.jpg',
  '/images/highlights/LittleGrapplers-05865.jpg',
];

export default function AboutPage() {
  return (
    <div className="bg-[#F7F9F9] text-[#1F2A44] overflow-hidden">
      {/* Hero - Full Screen Cinematic */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/highlights/LittleGrapplers-05865.jpg"
            alt="Coach Stephen"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Light mode overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F9F9] via-[#F7F9F9]/70 to-[#F7F9F9]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F9F9]/90 via-transparent to-[#F7F9F9]/50" />
        </div>

        {/* Hero Content */}
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2EC4B6] mb-6">
              The Man Behind the Mission
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] tracking-tight text-[#1F2A44]">
              Coach<br />
              <span className="font-serif italic font-normal text-[#2EC4B6]">Stephen.</span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-[#1F2A44]/70 max-w-xl leading-relaxed">
              Brown belt. Educator. On a mission to build confident, 
              resilient kids through the art of Jiu-Jitsu.
            </p>
          </FadeIn>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-[#1F2A44]/50">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-[#2EC4B6] to-transparent" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 border-y border-[#1F2A44]/10 bg-white">
        <Container>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={0.1}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-black text-[#2EC4B6]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm uppercase tracking-widest text-[#1F2A44]/50">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Story Section - Asymmetric Layout */}
      <section className="py-32 md:py-40 bg-[#F7F9F9]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text */}
            <FadeIn direction="up" className="order-2 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F7931E] mb-6">
                The Journey
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight text-[#1F2A44]">
                From the mats to the <span className="font-serif italic font-normal text-[#2EC4B6]">mission.</span>
              </h2>
              <div className="mt-8 space-y-6 text-lg text-[#1F2A44]/70 leading-relaxed">
                <p>
                  Coach Stephen has been dedicated to Brazilian Jiu-Jitsu for as long as he can remember. 
                  With years of experience and a deep love for teaching, he specializes in introducing 
                  children to the fundamentals of BJJ.
                </p>
                <p>
                  Currently coaching at both Corvo locations, he creates a supportive environment 
                  where kids don't just learn techniques—they develop resilience, teamwork, and 
                  a sense of accomplishment that extends far beyond the mats.
                </p>
              </div>
            </FadeIn>

            {/* Image */}
            <FadeIn direction="up" delay={0.2} className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-[#2EC4B6]/20">
                <Image
                  src="/images/highlights/LittleGrapplers-05858.jpg"
                  alt="Coach Stephen teaching"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Vision Section - Full Width */}
      <section className="relative py-32 md:py-40 bg-gradient-to-br from-[#8FE3CF]/20 via-white to-[#2EC4B6]/10">
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image */}
            <FadeIn direction="up">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-[#2EC4B6]/20">
                <Image
                  src="/images/highlights/LittleGrapplers-05971.jpg"
                  alt="Little Grapplers training"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn direction="up" delay={0.2}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2EC4B6] mb-6">
                The Vision
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight text-[#1F2A44]">
                BJJ where kids <span className="font-serif italic font-normal text-[#F7931E]">already are.</span>
              </h2>
              <div className="mt-8 space-y-6 text-lg text-[#1F2A44]/70 leading-relaxed">
                <p>
                  Coach Stephen launched a unique initiative to bring Brazilian Jiu-Jitsu 
                  directly to daycare centers, empowering young children at an even earlier age.
                </p>
                <p>
                  By providing an alternative to traditional activities like soccer or basketball, 
                  Little Grapplers introduces children to a discipline that promotes both mental 
                  and physical growth—an offering that sets the program apart.
                </p>
                <p className="text-[#1F2A44] font-medium">
                  One confident, disciplined child at a time.
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Photo Gallery */}
      <section className="py-32 md:py-40 bg-white">
        <Container>
          <FadeIn direction="up" className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFC857] mb-6">
              On The Mats
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-[#1F2A44]">
              Where the <span className="font-serif italic font-normal text-[#2EC4B6]">magic</span> happens.
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
            {galleryImages.map((src, i) => (
              <StaggerItem key={src}>
                <div className={`relative overflow-hidden rounded-2xl shadow-lg ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'}`}>
                  <Image
                    src={src}
                    alt={`Little Grapplers training ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#1F2A44]/10 hover:bg-transparent transition-colors duration-500" />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Signature Section - Cinematic Split */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[70vh]">
          {/* Left - Image */}
          <div className="relative h-[50vh] lg:h-auto">
            <Image
              src="/images/highlights/LittleGrapplers-05873.jpg"
              alt="Coach Stephen on the mats"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F7F9F9]/80 lg:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F7F9F9] via-[#F7F9F9]/60 to-transparent lg:hidden" />
          </div>

          {/* Right - Content */}
          <div className="relative flex items-center bg-[#F7F9F9] py-20 lg:py-32">
            <Container className="relative z-10">
              <FadeIn direction="up" className="max-w-lg">
                {/* Belt rank indicator */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-1 w-12 rounded-full bg-[#8B4513]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2A44]/50">
                    Brown Belt
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#1F2A44] leading-[0.95]">
                  Stephen<br />
                  <span className="font-serif italic font-normal text-[#2EC4B6]">Shnayderman</span>
                </h2>

                <p className="mt-8 text-lg text-[#1F2A44]/70 leading-relaxed">
                  Dedicated practitioner. Patient teacher. Building the next generation 
                  of confident, disciplined martial artists—one class at a time.
                </p>

                {/* Credentials */}
                <div className="mt-10 flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-full border border-[#2EC4B6]/30 bg-[#2EC4B6]/10 text-sm text-[#1F2A44]/80">
                    10+ Years Training
                  </span>
                  <span className="px-4 py-2 rounded-full border border-[#F7931E]/30 bg-[#F7931E]/10 text-sm text-[#1F2A44]/80">
                    BJJ Brown Belt
                  </span>
                  <span className="px-4 py-2 rounded-full border border-[#FFC857]/30 bg-[#FFC857]/10 text-sm text-[#1F2A44]/80">
                    Youth Specialist
                  </span>
                </div>
              </FadeIn>
            </Container>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-40 relative bg-gradient-to-br from-[#2EC4B6] to-[#1a9e92]">
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-6">
              Ready to Start?
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white">
              Let's build something <span className="font-serif italic font-normal text-[#FFC857]">great</span> together.
            </h2>
            <p className="mt-8 text-xl text-white/80 max-w-xl mx-auto">
              Interested in bringing BJJ to your daycare or enrolling your child? 
              Coach Stephen would love to hear from you.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white hover:bg-white/90 text-[#1F2A44] h-12 px-8" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-[#1F2A44] h-12 px-8" asChild>
                <Link href="/inquiry">
                  Enroll Now
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
