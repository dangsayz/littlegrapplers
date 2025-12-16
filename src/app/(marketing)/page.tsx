'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Play, ChevronDown, Star, Check, Dumbbell, Brain, Heart, Shield } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-white selection:bg-[#2EC4B6] selection:text-black overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO - Massive typography with gradient mesh background
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#2EC4B6]/20 blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F7931E]/15 blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#FF5A5F]/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex-1 flex items-center pt-32">
          <Container>
            <div className="max-w-[90vw]">
              <FadeIn direction="up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-[#2EC4B6]" />
                  <span className="text-[#2EC4B6] text-sm font-medium tracking-[0.2em] uppercase">Youth BJJ • Dallas-Fort Worth</span>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.1}>
                <h1 className="text-[clamp(3rem,12vw,10rem)] font-black leading-[0.85] tracking-[-0.04em]">
                  <span className="block">Build</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] via-[#8FE3CF] to-[#2EC4B6]">
                    confidence.
                  </span>
                </h1>
              </FadeIn>

              <FadeIn direction="up" delay={0.2}>
                <div className="mt-6 ml-[5vw] md:ml-[15vw]">
                  <h2 className="text-[clamp(2rem,8vw,6rem)] font-black leading-[0.9] tracking-[-0.03em] text-white/90">
                    Build <span className="text-[#FFC857]">character.</span>
                  </h2>
                </div>
              </FadeIn>

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
                      <span className="absolute inset-0 bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative group-hover:text-white transition-colors">Enroll Now</span>
                      <ArrowUpRight className="h-5 w-5 relative transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                    </Link>
                    
                    <Link 
                      href="#story"
                      className="group flex items-center gap-3 px-6 py-4 text-white/70 hover:text-white transition-colors"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 group-hover:border-[#2EC4B6] group-hover:bg-[#2EC4B6]/10 transition-all">
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

      
      {/* ═══════════════════════════════════════════════════════════════════════
          BENTO GRID - Mission & Video
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="py-24 md:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large mission card */}
            <FadeIn direction="up" className="lg:col-span-7">
              <div className="relative h-full min-h-[400px] rounded-3xl bg-gradient-to-br from-[#1F2A44] to-[#0a0f1a] p-8 md:p-12 overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2EC4B6]/10 rounded-full blur-[80px] group-hover:bg-[#2EC4B6]/20 transition-all duration-700" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#2EC4B6]/20 text-[#2EC4B6] text-xs font-bold uppercase tracking-wider mb-6">
                      Our Mission
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9]">
                      Empower
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF]">
                        your kids.
                      </span>
                    </h2>
                  </div>
                  
                  <p className="mt-8 text-lg text-white/50 max-w-md leading-relaxed">
                    We provide a safe, nurturing environment at partner daycare centers through a one-of-a-kind Brazilian Jiu-Jitsu program.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Video card */}
            <FadeIn direction="up" delay={0.1} className="lg:col-span-5">
              <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden group cursor-pointer">
                <Image
                  src="/images/highlights/LittleGrapplers-05971.jpg"
                  alt="Training session"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:scale-110 group-hover:bg-[#2EC4B6] transition-all duration-300">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-white/70 text-sm">Watch our story</span>
                  <h3 className="text-xl font-bold text-white mt-1">See the Transformation</h3>
                </div>
              </div>
            </FadeIn>

            {/* Quote card */}
            <FadeIn direction="up" delay={0.2} className="lg:col-span-12">
              <div className="relative rounded-3xl bg-[#FFC857] p-8 md:p-12 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F7931E]/30 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#FF5A5F]/20 rounded-full" />
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#1F2A44] leading-tight">
                    "Sometimes it is the people no one can imagine anything of who do the things
                    <span className="font-black not-italic"> no one can imagine.</span>"
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BENEFITS - Grid layout (no horizontal scroll)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <Container>
          <FadeIn direction="up" className="mb-16">
            <span className="text-[#2EC4B6] text-sm font-medium tracking-[0.2em] uppercase">The Art</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9]">
              What is
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931E] to-[#FFC857]">
                Brazilian Jiu-Jitsu?
              </span>
            </h2>
          </FadeIn>

          {/* Grid layout */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { icon: Dumbbell, title: 'Full-Body Fitness', desc: 'Develops strength, flexibility, and coordination', color: '#2EC4B6' },
              { icon: Brain, title: 'Strategic Thinking', desc: 'Problem-solving skills through technique', color: '#F7931E' },
              { icon: Heart, title: 'Teamwork & Respect', desc: 'Building friendships and social skills', color: '#FF5A5F' },
              { icon: Shield, title: 'Bully-Proof Skills', desc: 'Confidence to handle any situation', color: '#FFC857' },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="group relative h-full rounded-3xl bg-[#1F2A44] p-8 overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                  <div 
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{ backgroundColor: item.color }}
                  />
                  
                  <div 
                    className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="h-8 w-8" style={{ color: item.color }} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          COACH - Split screen with image
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-white text-[#1F2A44]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="up">
              <span className="text-[#2EC4B6] text-sm font-medium tracking-[0.2em] uppercase">Leadership</span>
              <h2 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black leading-[0.85]">
                Coach
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF]">
                  Stephen.
                </span>
              </h2>
              
              <p className="mt-8 text-xl text-[#1F2A44]/70 leading-relaxed">
                Born and raised in Dallas, Stephen spent years searching for an outlet where he truly belonged.
              </p>
              <p className="mt-4 text-lg text-[#1F2A44]/50 leading-relaxed">
                That search led him to Brazilian Jiu-Jitsu over 11 years ago—a passion that gave him confidence, discipline, and purpose. Now an active competitor and dedicated coach, he's committed to sharing that same passion with the next generation.
              </p>
              
              <Link 
                href="/about"
                className="inline-flex items-center gap-2 mt-8 text-[#2EC4B6] font-semibold hover:gap-4 transition-all"
              >
                Learn more about our team
                <ArrowRight className="h-5 w-5" />
              </Link>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#2EC4B6]/20 to-[#F7931E]/20 rounded-3xl blur-2xl" />
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
                  <Image
                    src="/images/highlights/LittleGrapplers-05999.jpg"
                    alt="Coach Stephen"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 bg-[#FFC857] rounded-2xl p-6 shadow-2xl">
                  <div className="text-3xl font-black text-[#1F2A44]">11+</div>
                  <div className="text-sm text-[#1F2A44]/70">Years BJJ</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS - Large numbered steps
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <Container>
          <FadeIn direction="up" className="text-center mb-20">
            <span className="text-[#F7931E] text-sm font-medium tracking-[0.2em] uppercase">How It Works</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black">
              Three simple <span className="text-[#2EC4B6]">steps.</span>
            </h2>
          </FadeIn>

          <div className="space-y-0">
            {[
              { num: '01', title: 'Find', desc: "Check if your daycare is a partner. Not yet? We'll reach out.", color: '#2EC4B6' },
              { num: '02', title: 'Register', desc: 'Quick online signup. Select program. Done.', color: '#F7931E' },
              { num: '03', title: 'Train', desc: 'Classes at daycare + online video library access.', color: '#FFC857' },
            ].map((step, i) => (
              <FadeIn key={step.num} direction="up" delay={i * 0.1}>
                <div className="group relative border-b border-white/10 py-12 md:py-16 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div 
                      className="text-[8rem] md:text-[10rem] font-black leading-none opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ color: step.color }}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-lg text-white/50 max-w-md">{step.desc}</p>
                    </div>
                    <ArrowRight className="hidden md:block h-8 w-8 text-white/20 group-hover:text-white/60 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING - Modern cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-[#1F2A44]">
        <Container>
          <FadeIn direction="up" className="text-center mb-16">
            <span className="text-[#FFC857] text-sm font-medium tracking-[0.2em] uppercase">Membership</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black">
              Simple, transparent <span className="text-[#2EC4B6]">pricing.</span>
            </h2>
            <p className="mt-6 text-lg text-white/50 max-w-xl mx-auto">
              Choose the plan that fits your family. No hidden fees.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 3 Month Plan */}
            <FadeIn direction="up">
              <div className="relative rounded-3xl bg-[#0a0f1a] border border-white/10 p-8 md:p-10 overflow-hidden group hover:border-[#2EC4B6]/50 transition-colors">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2EC4B6]/5 rounded-full blur-[60px] group-hover:bg-[#2EC4B6]/10 transition-colors" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white">3 Months Paid-In-Full</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">$150</span>
                    <span className="text-white/40">one time</span>
                  </div>
                  
                  <ul className="mt-8 space-y-4">
                    {['Full access for 3 months', 'No recurring charges', 'All membership benefits'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-white/70">
                        <Check className="h-5 w-5 text-[#2EC4B6]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/waiver"
                    className="mt-8 block w-full py-4 text-center bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Monthly Plan - Highlighted */}
            <FadeIn direction="up" delay={0.1}>
              <div className="relative rounded-3xl bg-gradient-to-br from-[#2EC4B6] to-[#1F8A80] p-8 md:p-10 overflow-hidden group">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                  POPULAR
                </div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white">Monthly Agreement</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">$50</span>
                    <span className="text-white/70">/month</span>
                  </div>
                  
                  <ul className="mt-8 space-y-4">
                    {['Over 20 hours of video content', 'Unlimited lifetime access', 'Cancel anytime'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-white/90">
                        <Check className="h-5 w-5 text-white" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/waiver"
                    className="mt-8 block w-full py-4 text-center bg-white text-[#1F2A44] font-semibold rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIAL - Large quote
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <Container>
          <FadeIn direction="up" className="max-w-5xl mx-auto">
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-[#FFC857] text-[#FFC857]" />
              ))}
            </div>
            
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-white/90">
              "My son has completely transformed. He's more confident, more focused, and actually looks forward to
              <span className="text-[#2EC4B6] font-black"> 'martial arts day'</span> at daycare."
            </blockquote>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#2EC4B6] to-[#F7931E]" />
              <div>
                <div className="text-lg font-semibold text-white">Sarah M.</div>
                <div className="text-white/50">Parent, Sunshine Daycare</div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA - Full bleed with gradient
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6] via-[#1F8A80] to-[#1F2A44]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFC857]/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#FF5A5F]/20 rounded-full blur-[120px]" />
        </div>

        <Container className="relative z-10 text-center">
          <FadeIn direction="up">
            <h2 className="text-5xl md:text-6xl lg:text-8xl font-black leading-[0.85] text-white">
              Ready to
              <br />
              <span className="text-[#FFC857]">empower</span>
              <br />
              your child?
            </h2>
            
            <p className="mt-8 text-xl text-white/70 max-w-xl mx-auto">
              Join families across Dallas who've discovered the power of BJJ for their kids.
            </p>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.2}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/waiver"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-[#1F2A44] font-bold text-lg rounded-full hover:scale-105 transition-transform"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
