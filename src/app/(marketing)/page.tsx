import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Heart, Trophy, Zap, Users, Calendar, Video } from 'lucide-react';
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
import { FloatingProcessCards } from '@/components/ui/floating-process-cards';
import { GlassFeatureCard } from '@/components/ui/glass-feature-card';
import { PricingSection } from '@/components/ui/pricing-section';
import { GradientRevealSection } from '@/components/ui/gradient-reveal-section';

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

            <FadeInCTA delay={0.5} className="mt-12">
              <Button size="xl" variant="brand" className="text-lg px-8" asChild>
                <Link href="/inquiry">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </FadeInCTA>
          </div>
        </Container>

        <ScrollIndicator className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/50" />
      </section>

      {/* Story flows seamlessly - Mission */}
      <section className="py-20 md:py-28">
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
      <section className="relative py-20 md:py-28">
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
      <section className="py-20 md:py-28">
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
      <section className="py-20 md:py-28">
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

      {/* Photo Gallery - Glassmorphism Cards */}
      <section className="py-16 md:py-20">
        <Container>
          <StaggerContainer className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" staggerDelay={0.1}>
            {/* Featured Image Card */}
            <StaggerItem direction="up">
              <div className="group relative rounded-2xl p-1.5 bg-gradient-to-br from-background/20 via-background/5 to-transparent">
                <div className="absolute inset-0 rounded-2xl bg-background/5 backdrop-blur-xl border border-background/10" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image 
                    src="/images/highlights/bjjlittlegrapplers-2.jpg" 
                    alt="Kids training BJJ" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-background/70">Training Day</span>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Secondary Image Card */}
            <StaggerItem direction="up">
              <div className="group relative rounded-2xl p-1.5 bg-gradient-to-br from-background/20 via-background/5 to-transparent">
                <div className="absolute inset-0 rounded-2xl bg-background/5 backdrop-blur-xl border border-background/10" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image 
                    src="/images/highlights/LittleGrapplers-05865.jpg" 
                    alt="Coach with students" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-background/70">Building Champions</span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
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

      {/* Visual Process Section - Floating Cards */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/highlights/LittleGrapplers-05873.jpg"
            alt="Kids on their journey"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80" />
        </div>
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">The Journey</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
                  Your child's <span className="font-serif italic font-normal text-brand">path.</span>
                </h2>
                <p className="mt-8 text-xl text-background/60 leading-relaxed">
                  A structured progression that builds skills, confidence, and character step by step.
                </p>
              </FadeIn>
            </div>
            <FloatingProcessCards
              steps={[
                { number: '01', title: 'DISCOVER', active: true },
                { number: '02', title: 'PRACTICE', active: true },
                { number: '03', title: 'GROW', active: false },
                { number: '04', title: 'ACHIEVE', active: false },
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Glass Feature Cards Section */}
      <section className="py-16 md:py-24">
        <Container>
          <FadeIn direction="up" className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/40 mb-6">Program Features</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
              Everything <span className="font-serif italic font-normal text-brand">included.</span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassFeatureCard label="Classes" variant="brand">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-7.jpg"
                  alt="BJJ Classes"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-background">Weekly Training</h3>
              <p className="mt-2 text-background/60">
                Structured classes at your child's daycare, taught by certified instructors.
              </p>
            </GlassFeatureCard>

            <GlassFeatureCard label="Online">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/bjjlittlegrapplers-3.jpg"
                  alt="Video Library"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-background">Video Library</h3>
              <p className="mt-2 text-background/60">
                Access our online curriculum to practice techniques at home.
              </p>
            </GlassFeatureCard>

            <GlassFeatureCard label="Events" variant="accent">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/LittleGrapplers-05865.jpg"
                  alt="BJJ Events"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-background">Belt Ceremonies</h3>
              <p className="mt-2 text-background/60">
                Celebrate achievements with belt promotions and special events.
              </p>
            </GlassFeatureCard>
          </div>
        </Container>
      </section>

      {/* Gradient Reveal Section */}
      <GradientRevealSection
        primaryText="Confidence"
        secondaryText="starts here."
        description="Every session builds mental resilience, physical skills, and the self-belief that lasts a lifetime."
        variant="brand"
      />

      {/* Pricing Section */}
      <PricingSection
        subtitle="Membership"
        title="Simple, transparent pricing"
        description="Choose the plan that fits your family. No hidden fees."
        tiers={[
          {
            name: '3 Months Paid-In-Full',
            price: '$150',
            period: 'one time',
            description: 'Enjoy the convenience of a one-time payment for three months of membership. No recurring charges, no monthly billing—just full access to all your membership benefits.',
            ctaText: 'Sign Up',
            ctaLink: '/inquiry',
            features: [
              { text: 'Full access for 3 months', included: true },
              { text: 'No recurring charges', included: true },
              { text: 'All membership benefits included', included: true },
            ],
          },
          {
            name: 'Monthly Agreement',
            price: '$50',
            period: 'month',
            description: 'Flexible monthly membership with full access to all content and classes.',
            ctaText: 'Sign Up',
            ctaLink: '/inquiry',
            highlighted: true,
            features: [
              { text: 'Over 20 hours of video content', included: true },
              { text: 'Unlimited lifetime access', included: true },
              { text: 'Cancel anytime', included: true },
            ],
          },
        ]}
        features={[
          {
            icon: <Users className="w-5 h-5" />,
            title: 'Expert instruction',
            description: 'Certified coaches with child-focused training methodologies.',
          },
          {
            icon: <Calendar className="w-5 h-5" />,
            title: 'Flexible scheduling',
            description: 'Classes happen at daycare—no extra driving required.',
          },
          {
            icon: <Video className="w-5 h-5" />,
            title: 'Home practice support',
            description: 'Video tutorials to reinforce skills between sessions.',
          },
        ]}
      />

      {/* Testimonial */}
      <section className="py-20 md:py-28">
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
      <section className="relative py-20 md:py-28">
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
          <FadeIn direction="up" delay={0.15} className="mt-12">
            <Button size="xl" variant="brand" className="text-lg px-8" asChild>
              <Link href="/inquiry">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
