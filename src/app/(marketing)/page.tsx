import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, MapPin, Shield, Heart, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import {
  HeroText,
  FadeInCTA,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  ScrollIndicator,
} from '@/components/ui/motion';
import { FloatingVideo } from '@/components/ui/floating-video';

export default function HomePage() {
  return (
    <div className="bg-foreground text-background">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/highlights/LittleGrapplers-05971.jpg"
            alt="Kids training Brazilian Jiu-Jitsu"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50" />
        </div>

        <Container className="relative z-10 py-32">
          <div className="max-w-4xl">
            <FadeInCTA delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-background/60">Youth BJJ Program • Dallas</span>
              </div>
            </FadeInCTA>

            <HeroText
              className="font-display font-black tracking-tighter leading-[0.85]"
              lines={[
                { text: 'Build', className: 'text-[clamp(2.5rem,8vw,7rem)] text-background' },
                { text: 'confidence.', className: 'text-[clamp(2.5rem,8vw,7rem)] text-brand font-serif italic font-normal' },
                { text: 'Build', className: 'text-[clamp(2.5rem,8vw,7rem)] text-background' },
                { text: 'character.', className: 'text-[clamp(2.5rem,8vw,7rem)] text-brand font-serif italic font-normal' },
              ]}
            />
            
            <FadeInCTA delay={0.35}>
              <p className="mt-8 max-w-xl text-xl md:text-2xl text-background/80 font-medium">
                Empowering children through Jiu-Jitsu at your local daycare.
              </p>
            </FadeInCTA>

            <FadeInCTA delay={0.5} className="mt-12 flex flex-wrap gap-4">
              <Button size="xl" variant="brand" className="text-lg px-8" asChild>
                <Link href="/inquiry">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="text-lg px-8 border-background/30 text-background hover:bg-background/10" asChild>
                <Link href="/locations">
                  <MapPin className="h-5 w-5" />
                  Find Location
                </Link>
              </Button>
            </FadeInCTA>
          </div>
        </Container>

        <ScrollIndicator className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/50" />
      </section>

      {/* Story flows seamlessly - Mission */}
      <section className="py-32 md:py-48">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">Our Mission</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
                  Empower <span className="font-serif italic font-normal text-brand">your kids.</span>
                </h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="mt-8 text-xl text-background/70 leading-relaxed">
                  We provide a safe, nurturing environment at partner daycare centers through a one-of-a-kind Brazilian Jiu-Jitsu program.
                </p>
                <p className="mt-4 text-lg text-background/50 leading-relaxed">
                  Unlike soccer, basketball, or dance—Jiu-Jitsu builds confidence, discipline, and resilience like nothing else.
                </p>
              </FadeIn>
            </div>
            <FadeIn direction="up" delay={0.15}>
              <FloatingVideo
                src="/videos/hero-video.mp4"
                className="w-full max-w-xs mx-auto"
                delay={0.2}
              />
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Stats - integrated, no box */}
      <section className="py-16">
        <Container>
          <FadeIn direction="up">
            <div className="flex flex-wrap justify-center gap-16 md:gap-24">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-brand">11+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Years</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-brand">500+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Kids Trained</div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-black text-brand">15+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Daycares</div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Quote - full bleed image */}
      <section className="relative py-32 md:py-48">
        <div className="absolute inset-0">
          <Image
            src="/images/highlights/bjjlittlegrapplers2-7.jpg"
            alt="Training session"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <Container className="relative z-10">
          <FadeIn direction="none">
            <p className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-center max-w-4xl mx-auto leading-tight">
              "Sometimes it is the people no one can imagine anything of who do the things
              <span className="text-brand not-italic font-display font-black"> no one can imagine.</span>"
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Coach Stephen */}
      <section className="py-32 md:py-48">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="up" delay={0.15} className="lg:order-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                <Image
                  src="/images/highlights/LittleGrapplers-05999.jpg"
                  alt="Coach Stephen"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <div className="lg:order-1">
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">Leadership</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
                  Coach <span className="font-serif italic font-normal text-brand">Stephen.</span>
                </h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="mt-8 text-xl text-background/70 leading-relaxed">
                  Born and raised in Dallas, Stephen spent years searching for an outlet where he truly belonged.
                </p>
                <p className="mt-4 text-lg text-background/50 leading-relaxed">
                  That search led him to Brazilian Jiu-Jitsu over 11 years ago—a passion that gave him confidence, discipline, and purpose. Now an active competitor and dedicated coach, he's committed to sharing that same passion with the next generation.
                </p>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* What is BJJ */}
      <section className="py-32 md:py-48">
        <Container>
          <FadeIn direction="up" className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">The Art</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              What is <span className="font-serif italic font-normal text-brand">Brazilian Jiu-Jitsu?</span>
            </h2>
            <p className="mt-8 text-xl text-background/60 leading-relaxed">
              A dynamic martial art focusing on ground fighting, leverage, and technique—allowing practitioners to control opponents regardless of size or strength.
            </p>
          </FadeIn>

          <StaggerContainer className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-12" staggerDelay={0.08}>
            {[
              { icon: Zap, label: 'Physical', title: 'Full-Body Fitness' },
              { icon: Trophy, label: 'Mental', title: 'Strategic Thinking' },
              { icon: Heart, label: 'Social', title: 'Teamwork & Respect' },
              { icon: Shield, label: 'Safety', title: 'Bully-Proof Skills' },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="text-center">
                  <item.icon className="w-10 h-10 text-brand mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-wider text-background/40 mb-2">{item.label}</p>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Photo strip */}
      <section className="py-8">
        <StaggerContainer className="grid grid-cols-4 gap-2 px-2" staggerDelay={0.08}>
          {[
            '/images/highlights/bjjlittlegrapplers-2.jpg',
            '/images/highlights/bjjlittlegrapplers2-16.jpg',
            '/images/highlights/LittleGrapplers-05865.jpg',
            '/images/highlights/LittleGrapplers-05924.jpg',
          ].map((src, i) => (
            <StaggerItem key={i} direction="none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image src={src} alt="Training" fill className="object-cover" />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How it works */}
      <section className="py-32 md:py-48">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">How It Works</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
                  Three simple <span className="font-serif italic font-normal text-brand">steps.</span>
                </h2>
                <p className="mt-8 text-xl text-background/60 leading-relaxed">
                  We bring the program directly to your child's daycare. No extra driving. No schedule conflicts.
                </p>
              </FadeIn>
            </div>
            
            <StaggerContainer className="space-y-12" delay={0.2}>
              {[
                { num: '01', title: 'Find', desc: "Check if your daycare is a partner. Not yet? We'll reach out." },
                { num: '02', title: 'Register', desc: 'Quick online signup. Select program. Done.' },
                { num: '03', title: 'Train', desc: 'Classes at daycare + online video library access.' },
              ].map((item) => (
                <StaggerItem key={item.num}>
                  <div className="flex gap-6">
                    <div className="text-6xl font-black text-background/10">{item.num}</div>
                    <div>
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                      <p className="mt-2 text-background/50">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </Container>
      </section>

      {/* Testimonial */}
      <section className="py-32 md:py-48">
        <Container>
          <FadeIn direction="up" className="max-w-4xl mx-auto">
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-brand text-brand" />
              ))}
            </div>
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif italic leading-tight">
              "My son has completely transformed. He's more confident, more focused, and actually looks forward to
              <span className="text-brand not-italic font-display font-black"> 'martial arts day'</span> at daycare."
            </blockquote>
            <div className="mt-12">
              <div className="text-lg font-semibold">Sarah M.</div>
              <div className="text-background/50">Parent, Sunshine Daycare</div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 md:py-48">
        <div className="absolute inset-0">
          <Image
            src="/images/highlights/LittleGrapplers-05858.jpg"
            alt="Kids training"
            fill
            className="object-cover opacity-20"
          />
        </div>

        <Container className="relative z-10 text-center">
          <FadeIn direction="up">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black leading-tight">
              Ready to <span className="font-serif italic font-normal text-brand">empower</span><br />
              your child?
            </h2>
            <p className="mt-8 text-xl text-background/60 max-w-xl mx-auto">
              Join families across Dallas who've discovered the power of BJJ for their kids.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.15} className="mt-12 flex flex-wrap justify-center gap-6">
            <Button size="xl" variant="brand" className="text-lg px-8" asChild>
              <Link href="/inquiry">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="text-lg px-8 border-background/30 text-background hover:bg-background/10" asChild>
              <Link href="/contact">
                Contact Us
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
