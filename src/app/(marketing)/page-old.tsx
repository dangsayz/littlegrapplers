'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Play, ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-white selection:bg-[#2EC4B6] selection:text-black">
      {/* Hero - Full viewport with massive typography */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#2EC4B6]/20 blur-[150px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F7931E]/15 blur-[130px]" />
            <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#FF5A5F]/10 blur-[100px]" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center pt-32">
          <Container>
            <div className="max-w-[90vw]">
              {/* Eyebrow */}
              <FadeIn direction="up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-[#2EC4B6]" />
                  <span className="text-[#2EC4B6] text-sm font-medium tracking-[0.2em] uppercase">Youth BJJ • Dallas-Fort Worth</span>
                </div>
              </FadeIn>

              {/* Main headline - Massive display text */}
              <FadeIn direction="up" delay={0.1}>
                <h1 className="text-[clamp(3rem,12vw,10rem)] font-black leading-[0.85] tracking-[-0.04em]">
                  <span className="block">Build</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] via-[#8FE3CF] to-[#2EC4B6]">
                    confidence.
                  </span>
                </h1>
              </FadeIn>

              {/* Sub-headline with offset */}
              <FadeIn direction="up" delay={0.2}>
                <div className="mt-6 ml-[5vw] md:ml-[15vw]">
                  <h2 className="text-[clamp(2rem,8vw,6rem)] font-black leading-[0.9] tracking-[-0.03em] text-white/90">
                    Build <span className="text-[#FFC857]">character.</span>
                  </h2>
                </div>
              </FadeIn>

              {/* Description + CTA */}
              <FadeIn direction="up" delay={0.3}>
                <div className="mt-16 flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
                  <p className="max-w-md text-lg md:text-xl text-white/50 leading-relaxed">
                    Empowering kids ages 3-7 through Brazilian Jiu-Jitsu at partner daycares across Dallas.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Link 
                      href="/waiver"
                      className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-transform hover:scale-105"
                    >
                      <span>Enroll Now</span>
                      <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    
                    <Link 
                      href="#story"
                      className="group flex items-center gap-3 px-6 py-4 text-white/70 hover:text-white transition-colors"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                        <Play className="h-4 w-4 ml-0.5" />
                      </div>
                      <span className="text-sm font-medium">Watch Story</span>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>
          </Container>
        </div>

        {/* Bottom stats bar */}
        <FadeIn direction="up" delay={0.4}>
          <div className="relative z-10 border-t border-white/10">
            <Container>
              <div className="py-8 flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-12 md:gap-20">
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-[#2EC4B6]">500+</div>
                    <div className="text-sm text-white/40 mt-1">Kids Trained</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-[#F7931E]">11</div>
                    <div className="text-sm text-white/40 mt-1">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-black text-[#FFC857]">15+</div>
                    <div className="text-sm text-white/40 mt-1">Partner Daycares</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden md:flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <span className="text-sm">Scroll to explore</span>
                  <ChevronDown className="h-4 w-4 animate-bounce" />
                </button>
              </div>
            </Container>
          </div>
        </FadeIn>
      </section>

      {/* Story flows seamlessly - Mission - Subtle Cream Background with Grain */}
      <section className="relative py-20 md:py-28 bg-[#faf9f7]">
        {/* Subtle grain texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-6">Our Mission</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-foreground">
                  Empower <span className="font-serif italic font-normal text-brand">your kids.</span>
                </h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="mt-8 text-xl text-foreground/70 leading-relaxed">
                  We provide a safe, nurturing environment at partner daycare centers through a one-of-a-kind Brazilian Jiu-Jitsu program.
                </p>
                <p className="mt-4 text-lg text-foreground/50 leading-relaxed">
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

      {/* Stats - colorful cards */}
      <section className="py-16">
        <Container>
          <FadeIn direction="up">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <div className="text-center p-6 md:p-8 rounded-2xl bg-[#2EC4B6]/10 border border-[#2EC4B6]/20">
                <div className="text-5xl md:text-6xl font-black text-[#2EC4B6]">11+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Years</div>
              </div>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-[#F7931E]/10 border border-[#F7931E]/20">
                <div className="text-5xl md:text-6xl font-black text-[#F7931E]">500+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Kids Trained</div>
              </div>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-[#FFC857]/10 border border-[#FFC857]/20">
                <div className="text-5xl md:text-6xl font-black text-[#FFC857]">15+</div>
                <div className="mt-2 text-sm uppercase tracking-wider text-background/50">Daycares</div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Wave Separator */}
      <WaveSeparator color="#2EC4B6" />

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

      {/* Coach Stephen - White Background */}
      <section className="py-20 md:py-28 bg-background text-foreground">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="up" delay={0.15} className="lg:order-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-xl">
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-6">Leadership</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-foreground">
                  Coach <span className="font-serif italic font-normal text-brand">Stephen.</span>
                </h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="mt-8 text-xl text-foreground/70 leading-relaxed">
                  Born and raised in Dallas, Stephen spent years searching for an outlet where he truly belonged.
                </p>
                <p className="mt-4 text-lg text-foreground/50 leading-relaxed">
                  That search led him to Brazilian Jiu-Jitsu over 11 years ago—a passion that gave him confidence, discipline, and purpose. Now an active competitor and dedicated coach, he's committed to sharing that same passion with the next generation.
                </p>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* What is BJJ - Icon Badges Section */}
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

          {/* Circular Icon Badges - Amazing Athletes inspired with fun colors */}
          <StaggerContainer className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" staggerDelay={0.08}>
            <StaggerItem>
              <IconBadge icon="dumbbell" label="Full-Body Fitness" ringColor="#2EC4B6" />
            </StaggerItem>
            <StaggerItem>
              <IconBadge icon="brain" label="Strategic Thinking" ringColor="#F7931E" />
            </StaggerItem>
            <StaggerItem>
              <IconBadge icon="heart" label="Teamwork & Respect" ringColor="#FF5A5F" />
            </StaggerItem>
            <StaggerItem>
              <IconBadge icon="shield" label="Bully-Proof Skills" ringColor="#FFC857" />
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* Wave Separator */}
      <WaveSeparator color="#F7931E" flip />

      {/* Photo Gallery - Glassmorphism Cards */}
      <section className="py-16 md:py-20">
        <Container>
          <StaggerContainer className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" staggerDelay={0.1}>
            {/* Featured Image Card */}
            <StaggerItem direction="up">
              <div className="group relative rounded-2xl p-1.5 bg-gradient-to-br from-[#2EC4B6]/30 via-[#8FE3CF]/20 to-transparent">
                <div className="absolute inset-0 rounded-2xl bg-background/5 backdrop-blur-xl border border-[#2EC4B6]/20" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image 
                    src="/images/highlights/bjjlittlegrapplers-2.jpg" 
                    alt="Kids training BJJ" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#2EC4B6] text-xs font-bold uppercase tracking-wider text-white">Training Day</span>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Secondary Image Card */}
            <StaggerItem direction="up">
              <div className="group relative rounded-2xl p-1.5 bg-gradient-to-br from-[#F7931E]/30 via-[#FFC857]/20 to-transparent">
                <div className="absolute inset-0 rounded-2xl bg-background/5 backdrop-blur-xl border border-[#F7931E]/20" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image 
                    src="/images/highlights/LittleGrapplers-05865.jpg" 
                    alt="Coach with students" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#F7931E] text-xs font-bold uppercase tracking-wider text-white">Building Champions</span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* How it works - White Background with Grain */}
      <section className="relative py-20 md:py-28 bg-background text-foreground">
        {/* Grain texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <FadeIn direction="up">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-6">How It Works</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-foreground">
                  Three simple <span className="font-serif italic font-normal text-brand">steps.</span>
                </h2>
                <p className="mt-8 text-xl text-foreground/60 leading-relaxed">
                  We bring the program directly to your child's daycare. No extra driving. No schedule conflicts.
                </p>
              </FadeIn>
            </div>
            
            <StaggerContainer className="space-y-8" delay={0.2}>
              {[
                { num: '01', title: 'Find', desc: "Check if your daycare is a partner. Not yet? We'll reach out.", color: '#2EC4B6' },
                { num: '02', title: 'Register', desc: 'Quick online signup. Select program. Done.', color: '#F7931E' },
                { num: '03', title: 'Train', desc: 'Classes at daycare + online video library access.', color: '#FFC857' },
              ].map((item) => (
                <StaggerItem key={item.num}>
                  <div className="flex gap-6 p-6 rounded-2xl bg-foreground/5 border border-foreground/10 hover:border-foreground/20 transition-all">
                    <div className="text-5xl font-black" style={{ color: item.color }}>{item.num}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-foreground/50">{item.desc}</p>
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

      {/* Glass Feature Cards Section - White Background with Heavy Grain */}
      <section className="relative py-16 md:py-24 bg-background text-foreground">
        {/* Heavy grain texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        <Container className="relative z-10">
          <FadeIn direction="up" className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 mb-6">Program Features</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-foreground">
              Everything <span className="font-serif italic font-normal text-brand">included.</span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassFeatureCard label="Classes" variant="brand" className="border-t-4 border-t-[#2EC4B6]">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/bjjlittlegrapplers2-7.jpg"
                  alt="BJJ Classes"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground">Weekly Training</h3>
              <p className="mt-2 text-foreground/60">
                Structured classes at your child's daycare, taught by certified instructors.
              </p>
            </GlassFeatureCard>

            <GlassFeatureCard label="Online" className="border-t-4 border-t-[#F7931E]">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/bjjlittlegrapplers-3.jpg"
                  alt="Video Library"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground">Video Library</h3>
              <p className="mt-2 text-foreground/60">
                Access our online curriculum to practice techniques at home.
              </p>
            </GlassFeatureCard>

            <GlassFeatureCard label="Events" variant="accent" className="border-t-4 border-t-[#FFC857]">
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src="/images/highlights/LittleGrapplers-05865.jpg"
                  alt="BJJ Events"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground">Belt Ceremonies</h3>
              <p className="mt-2 text-foreground/60">
                Celebrate achievements with belt promotions and special events.
              </p>
            </GlassFeatureCard>
          </div>
        </Container>
      </section>

      {/* Fun Colorful Banner - Kid-Friendly */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#2EC4B6] via-[#8FE3CF] to-[#FFC857] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FF5A5F]" />
          <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-[#F7931E]" />
          <div className="absolute bottom-10 left-1/4 w-20 h-20 rounded-full bg-[#1F2A44]" />
          <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-white/50" />
        </div>
        <Container className="relative z-10">
          <FadeIn direction="up" className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1F2A44]">
              Why Kids Love It
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
              {[
                { text: 'Fun Games', color: '#FF5A5F' },
                { text: 'New Friends', color: '#F7931E' },
                { text: 'Cool Moves', color: '#1F2A44' },
                { text: 'Belt Rewards', color: '#2EC4B6' },
              ].map((item) => (
                <div 
                  key={item.text}
                  className="px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                  style={{ backgroundColor: item.color }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </FadeIn>
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
                <Star key={i} className="h-5 w-5 fill-[#FFC857] text-[#FFC857]" />
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
          <FadeIn direction="up" delay={0.15} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="brand" className="text-lg px-8" asChild>
              <Link href="/inquiry">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="text-lg px-8 border-background/30 text-background hover:bg-background/10" asChild>
              <Link href="/dashboard/waiver">
                Enroll Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
