'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Play, ChevronDown, Star, Check, Dumbbell, Brain, Heart, Shield, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem, HeroText, FadeInCTA } from '@/components/ui/motion';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="bg-[#F7F9F9] text-[#1F2A44] selection:bg-[#2EC4B6] selection:text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO - Cinematic, Breathtaking, Award-Winning Design
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
        
        {/* Video Background with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105"
            poster="/images/logo.jpg"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F2A44]/70 via-[#1F2A44]/50 to-[#1F2A44]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2EC4B6]/20 via-transparent to-[#F7931E]/20" />
          {/* Animated grain texture for premium feel */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
        </div>

        {/* Floating Animated Orbs - Creates depth and magic */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          {/* Large primary orb */}
          <motion.div
            className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(46,196,182,0.4) 0%, rgba(46,196,182,0) 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Secondary warm orb */}
          <motion.div
            className="absolute bottom-[15%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(247,147,30,0.35) 0%, rgba(247,147,30,0) 70%)',
              filter: 'blur(50px)',
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, -50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
          {/* Accent golden orb */}
          <motion.div
            className="absolute top-[50%] right-[25%] w-[20vw] h-[20vw] max-w-[250px] max-h-[250px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,200,87,0.3) 0%, rgba(255,200,87,0) 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
          />
          {/* Small floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/20"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.8,
              }}
            />
          ))}
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 flex-1 flex items-center pt-32 pb-8">
          <Container>
            <div className="max-w-[95vw] lg:max-w-[85vw]">
              
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#2EC4B6]"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-white/90 text-sm font-semibold tracking-wide">Youth BJJ</span>
                  <div className="w-px h-4 bg-white/30" />
                  <span className="text-[#8FE3CF] text-sm font-bold tracking-wider">Dallas-Fort Worth</span>
                </div>
              </motion.div>

              {/* Cinematic Hero Text with Character Animation */}
              <HeroText
                className="text-[clamp(3.5rem,14vw,12rem)] font-black leading-[0.85] tracking-[-0.04em]"
                lines={[
                  { text: 'Build', className: 'text-white drop-shadow-2xl' },
                  { text: 'confidence.', className: 'text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] via-[#8FE3CF] to-[#2EC4B6] animate-gradient-x' },
                ]}
              />

              {/* Secondary headline with stagger */}
              <motion.div
                className="mt-4 ml-[2vw] md:ml-[8vw]"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-[clamp(2.5rem,10vw,8rem)] font-black leading-[0.85] tracking-[-0.03em]">
                  <span className="text-white/90 drop-shadow-lg">Build </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931E] via-[#FFC857] to-[#F7931E] animate-gradient-x">character.</span>
                </h2>
              </motion.div>

              {/* Tagline and CTAs */}
              <FadeInCTA delay={1.2} className="mt-12 md:mt-16">
                <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
                  <motion.p 
                    className="max-w-lg text-lg md:text-xl text-white/70 leading-relaxed font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    Empowering kids ages 3-7 through Brazilian Jiu-Jitsu at partner daycares across Dallas.
                    <span className="block mt-2 text-[#8FE3CF] font-semibold">A kid who understands their own potential is unstoppable.</span>
                  </motion.p>
                  
                  <motion.div 
                    className="flex flex-wrap items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    {/* Primary CTA - Magnetic hover effect */}
                    <Link 
                      href="/waiver"
                      className="group relative inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F7931E] via-[#FFC857] to-[#F7931E] bg-[length:200%_100%] animate-gradient-x" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#F7931E] via-[#FFC857] to-[#F7931E] blur-xl" />
                      {/* Shine effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </div>
                      <span className="relative z-10">Enroll Now</span>
                      <ArrowUpRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                    
                    {/* Secondary CTA - Play button with pulse */}
                    <Link 
                      href="#story"
                      className="group flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white transition-colors duration-300"
                    >
                      <div className="relative flex h-14 w-14 items-center justify-center">
                        {/* Animated pulse rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#2EC4B6]/40 animate-ping opacity-30" />
                        <div className="absolute inset-1 rounded-full border border-[#2EC4B6]/30 animate-pulse" />
                        {/* Main button */}
                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/30 group-hover:bg-[#2EC4B6] group-hover:border-[#2EC4B6] transition-all duration-300 shadow-lg">
                          <Play className="h-5 w-5 ml-0.5 text-white" fill="currentColor" />
                        </div>
                      </div>
                      <span className="text-sm font-semibold tracking-wide">Watch Story</span>
                    </Link>
                  </motion.div>
                </div>
              </FadeInCTA>
            </div>
          </Container>
        </div>

        {/* Bottom Stats Bar - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <Container>
              <div className="py-6 md:py-8 flex flex-wrap items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-8 md:gap-16 lg:gap-24">
                  {/* Animated Counter Stats */}
                  {[
                    { value: '500+', label: 'Kids Trained', color: '#2EC4B6' },
                    { value: '11', label: 'Years Experience', color: '#F7931E' },
                    { value: '15+', label: 'Partner Daycares', color: '#FF5A5F' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 2 + index * 0.15 }}
                      className="relative group"
                    >
                      <div 
                        className="text-4xl md:text-5xl lg:text-6xl font-black transition-transform duration-300 group-hover:scale-110"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-white/50 font-medium mt-1 tracking-wide">{stat.label}</div>
                      {/* Hover glow */}
                      <div 
                        className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                        style={{ background: stat.color }}
                      />
                    </motion.div>
                  ))}
                </div>
                
                {/* Scroll indicator */}
                <motion.button 
                  onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hidden md:flex items-center gap-3 text-white/40 hover:text-white transition-colors duration-300 group"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  <span className="text-sm font-medium tracking-wide">Scroll to explore</span>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </motion.button>
              </div>
            </Container>
          </div>
        </motion.div>
      </section>

      
      {/* ═══════════════════════════════════════════════════════════════════════
          BENTO GRID - Mission & Video
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="py-24 md:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large mission card */}
            <FadeIn direction="up" className="lg:col-span-7">
              <div className="relative h-full min-h-[400px] rounded-3xl bg-gradient-to-br from-[#2EC4B6] to-[#1a9e92] p-8 md:p-12 overflow-hidden group shadow-2xl shadow-[#2EC4B6]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8FE3CF]/30 rounded-full blur-[60px]" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
                      Our Mission
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] text-white">
                      Empower
                      <br />
                      <span className="text-[#FFC857]">
                        your kids.
                      </span>
                    </h2>
                  </div>
                  
                  <p className="mt-8 text-lg text-white/80 max-w-md leading-relaxed">
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
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <FadeIn direction="up" className="mb-16">
            <span className="text-[#2EC4B6] text-sm font-bold tracking-[0.2em] uppercase">The Art</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] text-[#1F2A44]">
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
                <div className="group relative h-full rounded-3xl bg-[#F7F9F9] border border-[#1F2A44]/10 p-8 overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                  <div 
                    className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
                    style={{ backgroundColor: item.color }}
                  />
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundColor: item.color }}
                  />
                  
                  <div 
                    className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="h-8 w-8" style={{ color: item.color }} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1F2A44] mb-3">{item.title}</h3>
                  <p className="text-[#1F2A44]/60 text-sm">{item.desc}</p>
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
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 bg-[#F7F9F9]">
        <Container>
          <FadeIn direction="up" className="text-center mb-20">
            <span className="text-[#F7931E] text-sm font-bold tracking-[0.2em] uppercase">How It Works</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black text-[#1F2A44]">
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
                <div className="group relative border-b border-[#1F2A44]/10 py-12 md:py-16 hover:bg-white/50 transition-colors rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div 
                      className="text-[8rem] md:text-[10rem] font-black leading-none opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ color: step.color }}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-bold text-[#1F2A44] mb-3">{step.title}</h3>
                      <p className="text-lg text-[#1F2A44]/60 max-w-md">{step.desc}</p>
                    </div>
                    <ArrowRight className="hidden md:block h-8 w-8 text-[#1F2A44]/20 group-hover:text-[#2EC4B6] group-hover:translate-x-2 transition-all" />
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
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <FadeIn direction="up" className="text-center mb-16">
            <span className="text-[#F7931E] text-sm font-bold tracking-[0.2em] uppercase">Membership</span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black text-[#1F2A44]">
              Simple, transparent <span className="text-[#2EC4B6]">pricing.</span>
            </h2>
            <p className="mt-6 text-lg text-[#1F2A44]/60 max-w-xl mx-auto">
              Choose the plan that fits your family. No hidden fees.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* 3 Month Plan */}
            <FadeIn direction="up">
              <div className="relative rounded-3xl bg-[#F7F9F9] border border-[#1F2A44]/10 p-8 md:p-10 overflow-hidden group hover:border-[#2EC4B6]/50 hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2EC4B6]/10 rounded-full blur-[60px] group-hover:bg-[#2EC4B6]/20 transition-colors" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[#1F2A44]">3 Months Paid-In-Full</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[#1F2A44]">$150</span>
                    <span className="text-[#1F2A44]/50">one time</span>
                  </div>
                  
                  <ul className="mt-8 space-y-4">
                    {['Full access for 3 months', 'No recurring charges', 'All membership benefits'].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-[#1F2A44]/70">
                        <Check className="h-5 w-5 text-[#2EC4B6]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/waiver"
                    className="mt-8 block w-full py-4 text-center bg-[#1F2A44]/10 hover:bg-[#1F2A44]/20 text-[#1F2A44] font-semibold rounded-xl transition-colors"
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
      <section className="py-24 md:py-32 bg-[#F7F9F9]">
        <Container>
          <FadeIn direction="up" className="max-w-5xl mx-auto">
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-[#FFC857] text-[#FFC857]" />
              ))}
            </div>
            
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-[#1F2A44]">
              "My son has completely transformed. He's more confident, more focused, and actually looks forward to
              <span className="text-[#2EC4B6] font-black"> 'martial arts day'</span> at daycare."
            </blockquote>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#2EC4B6] to-[#F7931E]" />
              <div>
                <div className="text-lg font-semibold text-[#1F2A44]">Sarah M.</div>
                <div className="text-[#1F2A44]/50">Parent, Sunshine Daycare</div>
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
