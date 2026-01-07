import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Award, Users, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'About Coach Stephen - Youth BJJ Instructor Dallas',
  description:
    'Meet Coach Stephen, a BJJ brown belt with 10+ years experience dedicated to teaching kids Brazilian Jiu-Jitsu at daycare centers across Dallas-Fort Worth.',
  keywords: ['Coach Stephen', 'BJJ instructor Dallas', 'kids martial arts teacher', 'youth BJJ coach'],
  openGraph: {
    title: 'About Coach Stephen - Little Grapplers',
    description: 'Meet the passionate BJJ instructor behind Little Grapplers youth programs in Dallas-Fort Worth.',
    images: ['/images/highlights/LittleGrapplers-05858.jpg'],
  },
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
    <div className="bg-[#FFF9F5] text-[#1F2A44] overflow-hidden">
      {/* Hero - Full Screen with Pastel Magic */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Pastel gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE5EC] via-[#E8F4F8] to-[#FFF0E5]" />
        
        {/* Premium grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        
        {/* Floating pastel shapes - playful & kid-friendly */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large soft circle - top right */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFD6E0]/60 to-[#FFAEC9]/40 blur-3xl animate-float" />
          {/* Medium circle - left */}
          <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full bg-gradient-to-tr from-[#B8E4F0]/50 to-[#87CEEB]/30 blur-2xl animate-float-delayed" />
          {/* Small accent - bottom */}
          <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-[#FFE4B5]/50 to-[#FFDAB9]/40 blur-2xl animate-float" style={{ animationDelay: '1s' }} />
          {/* Tiny floating dots */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 rounded-full bg-[#FFB6C1] animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-[#98D8C8] animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 right-1/5 w-5 h-5 rounded-full bg-[#FFE4B5] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        </div>

        {/* Hero Content */}
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-4xl">
            {/* Playful badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#FFB6C1]/30 shadow-lg shadow-[#FFB6C1]/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F2A44]/70">
                The Man Behind the Mission
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.9] tracking-tight">
              <span className="text-[#1F2A44]">Coach</span><br />
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#2EC4B6] via-[#5BD4C8] to-[#F7931E] bg-clip-text text-transparent">Stephen.</span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-[#1F2A44]/70 max-w-xl leading-relaxed">
              Brown belt. Educator. On a mission to build confident, 
              resilient kids through the art of Jiu-Jitsu.
            </p>
            
            {/* Playful decorative element */}
            <div className="mt-10 flex items-center gap-3">
              <div className="h-1 w-12 rounded-full bg-[#FFB6C1]" />
              <div className="h-1 w-8 rounded-full bg-[#98D8C8]" />
              <div className="h-1 w-4 rounded-full bg-[#FFE4B5]" />
            </div>
          </FadeIn>
        </Container>

        {/* Scroll indicator - playful */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-[#1F2A44]/40 font-medium">Scroll</span>
          <div className="relative">
            <div className="w-6 h-10 rounded-full border-2 border-[#2EC4B6]/40 flex justify-center pt-2">
              <div className="w-1.5 h-3 rounded-full bg-[#2EC4B6] animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Apple-inspired minimal design */}
      <section className="py-24 relative">
        {/* Clean white background */}
        <div className="absolute inset-0 bg-[#FBFBFD]" />
        
        <Container className="relative z-10">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.08}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="group relative p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-[#1F2A44]/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#1F2A44]/[0.1] transition-all duration-500 ease-out active:scale-[0.98]">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-[#1F2A44] group-hover:text-[#1F2A44] transition-colors">
                      {stat.value}
                    </div>
                    <div className="mt-2 sm:mt-3 text-[11px] sm:text-[13px] uppercase tracking-[0.1em] sm:tracking-[0.12em] text-[#1F2A44]/40 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* Story Section - Playful Asymmetric Layout */}
      <section className="py-32 md:py-40 relative">
        {/* Pastel background with floating shapes */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#FFF9F5] via-[#FFFAF8] to-[#F5FFFA]" />
        {/* Grain */}
        <div 
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Floating decorative blobs */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFE4B5]/40 to-[#FFDAB9]/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-[#B8E4F0]/30 to-[#98D8C8]/20 blur-2xl" />
        
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text */}
            <FadeIn direction="up" className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="h-1 w-8 rounded-full bg-[#F7931E]" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F7931E]">
                  The Journey
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight text-[#1F2A44]">
                From the mats to the <span className="font-serif italic font-normal bg-gradient-to-r from-[#2EC4B6] to-[#5BD4C8] bg-clip-text text-transparent">mission.</span>
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

            {/* Image with playful frame */}
            <FadeIn direction="up" delay={0.2} className="order-1 lg:order-2">
              <div className="relative">
                {/* Decorative background shape */}
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#FFB6C1]/30 via-[#98D8C8]/20 to-[#FFE4B5]/30 blur-sm" />
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-[#FF6B9D]/10 border-4 border-white">
                  <Image
                    src="/images/highlights/LittleGrapplers-05858.jpg"
                    alt="Coach Stephen teaching"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Floating accent badges */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white border border-[#1F2A44]/10 shadow-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-[#1F2A44]/40" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-9 h-9 rounded-full bg-white border border-[#1F2A44]/10 shadow-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-[#1F2A44]/40" />
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Vision Section - Dreamy pastel world */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Beautiful pastel gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F8F5] via-[#FFF5F8] to-[#FFF8E7]" />
        {/* Premium grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Floating dream shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-[#98D8C8]/40 to-[#B8E4F0]/20 blur-3xl animate-float" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-[#FFB6C1]/30 to-[#FFD6E0]/20 blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-[#FFE4B5]/40 to-[#FFDAB9]/20 blur-2xl" />
        </div>
        
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image with dreamy frame */}
            <FadeIn direction="up">
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-[#98D8C8]/40 via-[#FFB6C1]/30 to-[#FFE4B5]/40 blur-md" />
                <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-[#2EC4B6]/15 border-4 border-white/80">
                  <Image
                    src="/images/highlights/LittleGrapplers-05971.jpg"
                    alt="Little Grapplers training"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Subtle floating accents */}
                <div className="absolute -top-3 left-1/4 w-8 h-8 rounded-full bg-white border border-[#1F2A44]/10 shadow-lg flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-[#1F2A44]/40" />
                </div>
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn direction="up" delay={0.2}>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="h-1 w-8 rounded-full bg-[#2EC4B6]" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2EC4B6]">
                  The Vision
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight text-[#1F2A44]">
                BJJ where kids <span className="font-serif italic font-normal bg-gradient-to-r from-[#F7931E] to-[#FFC857] bg-clip-text text-transparent">already are.</span>
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
                <p className="text-[#1F2A44] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B9D]" />
                  One confident, disciplined child at a time.
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Photo Gallery - Playful mosaic */}
      <section className="py-32 md:py-40 relative">
        {/* Soft background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFAF8] via-white to-[#FFF5F7]" />
        {/* Grain */}
        <div 
          className="absolute inset-0 opacity-[0.3] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-1 w-4 rounded-full bg-[#FFC857]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFC857]">
                On The Mats
              </p>
              <div className="h-1 w-4 rounded-full bg-[#FFC857]" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-[#1F2A44]">
              Where the <span className="font-serif italic font-normal bg-gradient-to-r from-[#2EC4B6] to-[#98D8C8] bg-clip-text text-transparent">magic</span> happens.
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.1}>
            {galleryImages.map((src, i) => {
              const borderColors = ['#FFB6C1', '#98D8C8', '#FFE4B5', '#B8E4F0'];
              return (
                <StaggerItem key={src}>
                  <div className={`relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-square'}`}
                    style={{ border: `4px solid ${borderColors[i % borderColors.length]}40` }}>
                    <Image
                      src={src}
                      alt={`Little Grapplers training ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A44]/20 via-transparent to-transparent hover:from-transparent transition-all duration-500" />
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>

      {/* Signature Section - Dreamy Split with Pastel */}
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFF9F5]/40 to-[#FFF9F5] lg:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFF9F5] via-[#FFF9F5]/60 to-transparent lg:hidden" />
          </div>

          {/* Right - Content with pastel background */}
          <div className="relative flex items-center py-20 lg:py-32">
            {/* Pastel background */}
            <div className="absolute inset-0 bg-gradient-to-bl from-[#FFE5EC]/50 via-[#FFF9F5] to-[#E8F8F5]/30" />
            {/* Grain */}
            <div 
              className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Floating accent */}
            <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#FFB6C1]/30 to-[#FFD6E0]/20 blur-2xl" />
            
            <Container className="relative z-10">
              <FadeIn direction="up" className="max-w-lg">
                {/* Belt rank indicator */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-[#8B4513] to-[#A0522D]" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#1F2A44]/50">
                    Brown Belt
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#1F2A44] leading-[0.95]">
                  Stephen<br />
                  <span className="font-serif italic font-normal bg-gradient-to-r from-[#2EC4B6] to-[#5BD4C8] bg-clip-text text-transparent">Shnayderman</span>
                </h2>

                <p className="mt-8 text-lg text-[#1F2A44]/70 leading-relaxed">
                  Dedicated practitioner. Patient teacher. Building the next generation 
                  of confident, disciplined martial artists—one class at a time.
                </p>

                {/* Credentials - playful pastel badges */}
                <div className="mt-10 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1F2A44]/[0.08] text-sm text-[#1F2A44]/70 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-[#1F2A44]/50" />
                    10+ Years Training
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1F2A44]/[0.08] text-sm text-[#1F2A44]/70 shadow-sm">
                    <Award className="h-3.5 w-3.5 text-[#1F2A44]/50" />
                    BJJ Brown Belt
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1F2A44]/[0.08] text-sm text-[#1F2A44]/70 shadow-sm">
                    <Users className="h-3.5 w-3.5 text-[#1F2A44]/50" />
                    Youth Specialist
                  </span>
                </div>
              </FadeIn>
            </Container>
          </div>
        </div>
      </section>

      {/* CTA Section - Playful pastel with wow factor */}
      <section className="py-32 md:py-40 relative overflow-hidden">
        {/* Dreamy gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6] via-[#3DD4C6] to-[#5BD4C8]" />
        {/* Premium grain texture */}
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Floating shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#FFC857]/20 blur-3xl animate-float-delayed" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-[#FFB6C1]/20 blur-xl" />
          {/* Playful dots */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-white/40 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-[#FFC857]/60 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        </div>
        
        <Container className="relative z-10">
          <FadeIn direction="up" className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FFC857] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                Ready to Start?
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white">
              Let's build something <span className="font-serif italic font-normal text-[#FFC857]">great</span> together.
            </h2>
            <p className="mt-8 text-xl text-white/80 max-w-xl mx-auto">
              Interested in bringing BJJ to your daycare or enrolling your child? 
              Coach Stephen would love to hear from you.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white hover:bg-white/90 text-[#1F2A44] h-14 px-10 rounded-full shadow-xl shadow-black/10 hover:scale-105 transition-all duration-300" asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white hover:text-[#1F2A44] h-14 px-10 rounded-full backdrop-blur-sm hover:scale-105 transition-all duration-300" asChild>
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
