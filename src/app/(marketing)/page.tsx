'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Play, ChevronDown, Star, Check, Dumbbell, Brain, Heart, Shield, Sparkles, Award, MapPin } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem, HeroText, FadeInCTA } from '@/components/ui/motion';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';

// World-class Belt Journey Visual - Premium Design
const beltJourney = [
  { name: 'White', color: '#F8FAFC', accent: '#E2E8F0', glow: 'shadow-slate-200/50', description: 'The Beginning' },
  { name: 'Grey', color: '#64748B', accent: '#94A3B8', glow: 'shadow-slate-400/40', description: 'Foundation' },
  { name: 'Yellow', color: '#FACC15', accent: '#FDE047', glow: 'shadow-yellow-400/50', description: 'Growth' },
  { name: 'Orange', color: '#F97316', accent: '#FB923C', glow: 'shadow-orange-400/50', description: 'Strength' },
  { name: 'Green', color: '#22C55E', accent: '#4ADE80', glow: 'shadow-green-400/50', description: 'Mastery' },
];

// Location data for showcase
const featuredLocations = [
  {
    id: '1',
    name: 'Pinnacle Montessori',
    slug: 'pinnacle-montessori',
    area: 'Wylie',
    image: '/images/highlights/LittleGrapplers-05873.jpg',
    schedule: 'Mondays',
    color: '#2EC4B6',
    students: 35,
  },
  {
    id: '2',
    name: 'Lionheart Central',
    slug: 'lionheart-central-church',
    area: 'Plano',
    image: '/images/highlights/LittleGrapplers-05919.jpg',
    schedule: 'Tuesdays',
    color: '#F7931E',
    students: 28,
  },
  {
    id: '3',
    name: 'Lionheart First Baptist',
    slug: 'lionheart-first-baptist-plano',
    area: 'Plano',
    image: '/images/highlights/LittleGrapplers-05924.jpg',
    schedule: 'Wednesdays',
    color: '#FFC857',
    students: 22,
  },
];

function BeltJourneyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div ref={containerRef} className="relative">
      {/* Animated connecting line */}
      <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-yellow-400 via-orange-400 to-green-400"
          initial={{ height: '0%' }}
          animate={isInView ? { height: '100%' } : { height: '0%' }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="space-y-3">
        {beltJourney.map((belt, index) => (
          <motion.div
            key={belt.name}
            initial={{ opacity: 0, x: 40, rotateY: -15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 40, rotateY: -15 }}
            transition={{
              duration: 0.7,
              delay: index * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="relative"
          >
            <motion.div
              className={`relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 cursor-default transition-colors duration-300 ${hoveredIndex === index ? 'bg-white border-slate-200/80' : ''}`}
              animate={{
                scale: hoveredIndex === index ? 1.02 : 1,
                y: hoveredIndex === index ? -2 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                boxShadow: hoveredIndex === index 
                  ? `0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)`
                  : `0 1px 3px rgba(0,0,0,0.04)`,
              }}
            >
              {/* Belt medallion */}
              <div className="relative">
                <motion.div
                  className={`relative h-11 w-11 rounded-xl flex items-center justify-center ${belt.glow}`}
                  style={{ 
                    background: `linear-gradient(135deg, ${belt.color} 0%, ${belt.accent} 100%)`,
                    boxShadow: hoveredIndex === index ? `0 8px 24px -4px ${belt.color}60` : 'none',
                  }}
                  animate={{
                    scale: hoveredIndex === index ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Inner shine */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                  
                  {/* Animated ring on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: belt.accent }}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={hoveredIndex === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Rank number */}
                  <span className={`relative text-sm font-bold ${belt.name === 'White' || belt.name === 'Yellow' ? 'text-slate-700' : 'text-white'}`}>
                    {index + 1}
                  </span>
                </motion.div>
                
                {/* Pulse ring animation */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ background: belt.color }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={isInView ? {
                    opacity: [0, 0.4, 0],
                    scale: [1, 1.4, 1.4],
                  } : {}}
                  transition={{
                    duration: 1,
                    delay: 0.8 + index * 0.15,
                    ease: 'easeOut',
                  }}
                />
              </div>

              {/* Belt info */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="text-[15px] font-semibold text-slate-800 tracking-tight"
                  initial={{ opacity: 0, y: 6 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                >
                  {belt.name}
                </motion.div>
                <motion.div
                  className="text-[11px] text-slate-400 font-medium uppercase tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.12 }}
                >
                  {belt.description}
                </motion.div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: belt.color === '#F8FAFC' ? '#CBD5E1' : belt.color }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 0.4 + (i * 0.15), scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.12 + i * 0.05 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
                  <span className="text-white/90 drop-shadow-lg"></span>
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
          BENTO GRID - Mission & Video (Apple Glass Aesthetic)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="story" className="py-24 md:py-32 relative overflow-hidden">
        {/* Clean gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        
        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Progression card - Glass Style */}
            <FadeIn direction="up" className="lg:col-span-7">
              <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden">
                {/* Dark glass header background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-green-500/10" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-3xl" />
                
                <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider mb-6">
                      Structured Growth
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] text-white">
                      Clear goals.
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-green-400">
                        Real progress.
                      </span>
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                      Every belt earned is a milestone celebrated. Kids develop discipline through a proven system that rewards effort and commitment.
                    </p>
                    <div className="flex items-center gap-4 sm:gap-6 pt-2">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">5</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Belt Ranks</div>
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">4</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Stripes Each</div>
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-400">1</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">Journey</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Belt Progression - Interactive Visual */}
            <FadeIn direction="up" delay={0.1} className="lg:col-span-5">
              <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden bg-[#FBFBFD] border border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white" />
                
                <div className="relative z-10 h-full flex flex-col p-6 md:p-8">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <Award className="h-3 w-3" />
                      Belt Progression
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <BeltJourneyVisual />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200/60">
                    <p className="text-sm text-slate-500">IBJJF youth belt system</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Quote card - Apple Minimal Style */}
            <FadeIn direction="up" delay={0.2} className="lg:col-span-12">
              <div className="relative py-20 md:py-28">
                <div className="max-w-5xl mx-auto text-center px-4">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 leading-[1.3] tracking-tight">
                    Sometimes it is the people no one can imagine anything of who do the things{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF]">
                      no one can imagine.
                    </span>
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BENEFITS - Apple Glass Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <Container className="relative z-10">
          <FadeIn direction="up" className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800">
              What is
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                Brazilian Jiu-Jitsu?
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              More than martial arts — it's a journey of self-discovery that builds champions in life.
            </p>
          </FadeIn>

          {/* Apple Glass Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { 
                title: 'Full-Body Fitness', 
                desc: 'Develops strength, flexibility, and coordination through dynamic movements', 
                icon: Dumbbell,
                gradient: 'from-teal-400 to-emerald-500',
                bgGradient: 'from-teal-50 via-emerald-50/50 to-white',
              },
              { 
                title: 'Strategic Thinking', 
                desc: 'Problem-solving skills through technique — like physical chess', 
                icon: Brain,
                gradient: 'from-amber-400 to-orange-500',
                bgGradient: 'from-amber-50 via-orange-50/50 to-white',
              },
              { 
                title: 'Teamwork & Respect', 
                desc: 'Building lifelong friendships and essential social skills', 
                icon: Heart,
                gradient: 'from-rose-400 to-pink-500',
                bgGradient: 'from-rose-50 via-pink-50/50 to-white',
              },
              { 
                title: 'Bully-Proof Skills', 
                desc: 'Confidence to handle any situation with calm and control', 
                icon: Shield,
                gradient: 'from-violet-400 to-purple-500',
                bgGradient: 'from-violet-50 via-purple-50/50 to-white',
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <motion.div 
                  className="group relative h-full"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Glass card container */}
                  <div className="relative h-full rounded-[24px] overflow-hidden">
                    {/* Glass background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient}`} />
                    
                    {/* Top reflection/shine - Apple glass effect */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 via-white/30 to-transparent pointer-events-none" />
                    
                    {/* Subtle inner border glow */}
                    <div className="absolute inset-0 rounded-[24px] border border-white/80 pointer-events-none" />
                    <div className="absolute inset-[1px] rounded-[23px] border border-slate-200/40 pointer-events-none" />
                    
                    {/* Outer shadow for depth */}
                    <div className="absolute -inset-px rounded-[25px] bg-gradient-to-b from-slate-100/50 to-slate-200/30 -z-10" />
                    
                    <div className="relative z-10 p-6">
                      {/* Icon with gradient background */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg mb-5`}>
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
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
          LOCATIONS - State-of-the-Art Bento Grid
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#0A0F1C]">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1F2A44_0%,#0A0F1C_50%)]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#2EC4B6]/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#F7931E]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FFC857]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <Container className="relative z-10">
          <FadeIn direction="up" className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#2EC4B6] text-sm font-semibold tracking-wide mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EC4B6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EC4B6]"></span>
              </span>
              Where Champions Train
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight">
              Three locations.{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#2EC4B6] via-[#8FE3CF] to-[#2EC4B6] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                  One mission.
                </span>
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
              Building confident kids across the Dallas-Fort Worth metroplex
            </p>
          </FadeIn>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            {/* Featured Large Card - Spans 7 columns, 2 rows */}
            <FadeIn direction="up" className="md:col-span-7 md:row-span-2 h-[320px] md:h-[420px]">
              <Link href={`/community/${featuredLocations[0].slug}`} className="group block h-full">
                <motion.div 
                  className="relative h-full rounded-[2rem] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-[#2EC4B6] via-[#F7931E] to-[#2EC4B6] bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-[1px] rounded-[2rem] bg-[#0D1424] overflow-hidden">
                    <Image
                      src={featuredLocations[0].image}
                      alt={featuredLocations[0].name}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-[#0D1424]/60 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div 
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border border-white/20"
                          style={{ backgroundColor: `${featuredLocations[0].color}20` }}
                        >
                          <MapPin className="h-4 w-4" style={{ color: featuredLocations[0].color }} />
                          <span className="text-sm font-semibold text-white">{featuredLocations[0].area}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: featuredLocations[0].color }}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: featuredLocations[0].color }}></span>
                          </span>
                          <span className="text-xs font-medium text-white/70">{featuredLocations[0].students} students</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-white/40 mb-2">{featuredLocations[0].schedule}</div>
                        <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4">
                          {featuredLocations[0].name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <div 
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 group-hover:gap-3"
                            style={{ backgroundColor: featuredLocations[0].color, color: '#0D1424' }}
                          >
                            Enroll Now
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>

            {/* Second Card - Spans 5 columns */}
            <FadeIn direction="up" delay={0.1} className="md:col-span-5 h-[200px]">
              <Link href={`/community/${featuredLocations[1].slug}`} className="group block h-full">
                <motion.div 
                  className="relative h-full rounded-[2rem] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Gradient border */}
                  <div 
                    className="absolute -inset-[1px] rounded-[2rem] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${featuredLocations[1].color}, transparent 60%)` }}
                  />
                  
                  <div className="absolute inset-[1px] rounded-[2rem] bg-gradient-to-br from-[#1a2235] to-[#0D1424] overflow-hidden">
                    <Image
                      src={featuredLocations[1].image}
                      alt={featuredLocations[1].name}
                      fill
                      className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-[#0D1424]/80 to-[#0D1424]/40" />
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]" style={{ backgroundColor: `${featuredLocations[1].color}30` }} />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                          style={{ backgroundColor: `${featuredLocations[1].color}15` }}
                        >
                          <MapPin className="h-3.5 w-3.5" style={{ color: featuredLocations[1].color }} />
                          <span className="text-xs font-semibold text-white">{featuredLocations[1].area}</span>
                        </div>
                        <span className="text-xs font-medium text-white/40">{featuredLocations[1].students} students</span>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-white/30 mb-1">{featuredLocations[1].schedule}</div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-[#F7931E] transition-colors">
                          {featuredLocations[1].name}
                        </h3>
                        <div 
                          className="inline-flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                          style={{ color: featuredLocations[1].color }}
                        >
                          Enroll Now
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>

            {/* Third Card - Spans 5 columns */}
            <FadeIn direction="up" delay={0.2} className="md:col-span-5 h-[200px]">
              <Link href={`/community/${featuredLocations[2].slug}`} className="group block h-full">
                <motion.div 
                  className="relative h-full rounded-[2rem] overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Gradient border */}
                  <div 
                    className="absolute -inset-[1px] rounded-[2rem] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${featuredLocations[2].color}, transparent 60%)` }}
                  />
                  
                  <div className="absolute inset-[1px] rounded-[2rem] bg-gradient-to-br from-[#1a2235] to-[#0D1424] overflow-hidden">
                    <Image
                      src={featuredLocations[2].image}
                      alt={featuredLocations[2].name}
                      fill
                      className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-[#0D1424]/80 to-[#0D1424]/40" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px]" style={{ backgroundColor: `${featuredLocations[2].color}25` }} />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                          style={{ backgroundColor: `${featuredLocations[2].color}15` }}
                        >
                          <MapPin className="h-3.5 w-3.5" style={{ color: featuredLocations[2].color }} />
                          <span className="text-xs font-semibold text-white">{featuredLocations[2].area}</span>
                        </div>
                        <span className="text-xs font-medium text-white/40">{featuredLocations[2].students} students</span>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-white/30 mb-1">{featuredLocations[2].schedule}</div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-[#FFC857] transition-colors">
                          {featuredLocations[2].name}
                        </h3>
                        <div 
                          className="inline-flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                          style={{ color: featuredLocations[2].color }}
                        >
                          Enroll Now
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>
          </div>

          {/* Stats Row */}
          <FadeIn direction="up" delay={0.4} className="mt-12">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">85+</div>
                <div className="text-sm text-white/40 mt-1">Active Students</div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">3</div>
                <div className="text-sm text-white/40 mt-1">DFW Locations</div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">4.9</div>
                <div className="text-sm text-white/40 mt-1">Parent Rating</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.5} className="mt-12 text-center">
            <Link 
              href="/locations"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Explore all locations
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING - Apple Glass Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-slate-50">
        <Container>
          <FadeIn direction="up" className="text-center mb-16">
            <span className="text-[#2EC4B6] text-sm font-semibold tracking-wide uppercase">Membership</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-800">
              Simple, transparent pricing.
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              Choose the plan that fits your family. No hidden fees.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 3 Month Plan - Light Glass Card */}
            <FadeIn direction="up">
              <motion.div 
                className="group relative"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Glass card container */}
                <div className="relative rounded-[28px] overflow-hidden">
                  {/* Glass background with Apple-style gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
                  
                  {/* Top reflection/shine - Apple glass effect */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none" />
                  
                  {/* Subtle inner border glow */}
                  <div className="absolute inset-0 rounded-[28px] border border-white/80 pointer-events-none" />
                  <div className="absolute inset-[1px] rounded-[27px] border border-slate-200/50 pointer-events-none" />
                  
                  {/* Outer shadow for depth */}
                  <div className="absolute -inset-px rounded-[29px] bg-gradient-to-b from-slate-200/50 to-slate-300/30 -z-10" />
                  
                  <div className="relative z-10 p-8 md:p-10">
                    <h3 className="text-xl font-bold text-slate-800">3 Months Paid-In-Full</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900">$150</span>
                      <span className="text-slate-500">one time</span>
                    </div>
                    
                    <ul className="mt-8 space-y-4">
                      {['Full access for 3 months', 'No recurring charges', 'All membership benefits'].map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-slate-600">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100">
                            <Check className="h-3 w-3 text-teal-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link 
                      href="/waiver"
                      className="mt-8 block w-full py-4 text-center bg-slate-800 text-white font-semibold rounded-2xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/10"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
            </FadeIn>

            {/* Monthly Plan - Dark Glass Card (Featured) */}
            <FadeIn direction="up" delay={0.1}>
              <motion.div 
                className="group relative"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Glass card container */}
                <div className="relative rounded-[28px] overflow-hidden">
                  {/* Dark glass background with Apple-style gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                  
                  {/* Teal accent glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-emerald-500/10" />
                  
                  {/* Top reflection/shine - Apple glass effect */}
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />
                  
                  {/* Subtle inner border glow */}
                  <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none" />
                  <div className="absolute inset-[1px] rounded-[27px] border border-white/5 pointer-events-none" />
                  
                  {/* Corner glow orbs */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-400/30 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl" />
                  
                  {/* Popular badge */}
                  <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">
                    POPULAR
                  </div>
                  
                  <div className="relative z-10 p-8 md:p-10">
                    <h3 className="text-xl font-bold text-white">Monthly Agreement</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">$50</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    
                    <ul className="mt-8 space-y-4">
                      {['Over 20 hours of video content', 'Unlimited lifetime access', 'Cancel anytime'].map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-slate-300">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20">
                            <Check className="h-3 w-3 text-teal-400" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link 
                      href="/waiver"
                      className="mt-8 block w-full py-4 text-center bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition-colors shadow-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIAL - Apple Glass Card
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <Container>
          <FadeIn direction="up" className="max-w-5xl mx-auto">
            <motion.div 
              className="relative"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Glass card container */}
              <div className="relative rounded-[32px] overflow-hidden">
                {/* Glass background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
                
                {/* Top reflection/shine */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none" />
                
                {/* Subtle inner border glow */}
                <div className="absolute inset-0 rounded-[32px] border border-white/80 pointer-events-none" />
                <div className="absolute inset-[1px] rounded-[31px] border border-slate-200/50 pointer-events-none" />
                
                {/* Outer shadow for depth */}
                <div className="absolute -inset-px rounded-[33px] bg-gradient-to-b from-slate-200/50 to-slate-300/30 -z-10" />
                
                <div className="relative z-10 p-10 md:p-16">
                  <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-slate-800">
                    "My son has completely transformed. He's more confident, more focused, and actually looks forward to
                    <span className="text-teal-600 font-bold"> 'martial arts day'</span> at daycare."
                  </blockquote>
                  
                  <div className="mt-10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg" />
                    <div>
                      <div className="text-base font-semibold text-slate-800">Sarah M.</div>
                      <div className="text-slate-500 text-sm">Parent, Sunshine Daycare</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
