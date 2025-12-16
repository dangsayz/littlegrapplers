'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Users, Clock, Phone, ChevronRight, Building2, Check, ArrowUpRight, Shield, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const locations = [
  {
    id: '1',
    name: 'Lionheart Central Church',
    slug: 'lionheart-central-church',
    area: 'Dallas',
    address: '123 Central Ave, Dallas, TX 75001',
    image: '/images/highlights/LittleGrapplers-05873.jpg',
    schedule: 'Mon, Wed, Fri',
    ageGroups: '3-6 years',
    color: '#2EC4B6',
    students: 35,
  },
  {
    id: '2',
    name: 'Lionheart First Baptist Plano',
    slug: 'lionheart-first-baptist-plano',
    area: 'Plano',
    address: '456 First Baptist Way, Plano, TX 75023',
    image: '/images/highlights/LittleGrapplers-05919.jpg',
    schedule: 'Tue, Thu',
    ageGroups: '4-7 years',
    color: '#F7931E',
    students: 28,
  },
  {
    id: '3',
    name: 'Pinnacle at Montessori',
    slug: 'pinnacle-montessori',
    area: 'Richardson',
    address: '789 Montessori Dr, Richardson, TX 75080',
    image: '/images/highlights/LittleGrapplers-05924.jpg',
    schedule: 'Mon, Wed',
    ageGroups: '3-5 years',
    color: '#FFC857',
    students: 22,
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero Section with Floating Cards */}
      <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#1F2A44] to-[#0a0f1a]" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#2EC4B6]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#F7931E]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <FadeIn direction="up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EC4B6] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2EC4B6]"></span>
                </span>
                <span className="text-sm font-medium text-[#2EC4B6]">3 Locations Active</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                BJJ Programs at
                <br />
                <span className="text-[#2EC4B6]">Daycares Near You</span>
              </h1>
              
              <p className="mt-6 text-lg text-white/60 max-w-lg">
                We bring expert martial arts instruction directly to your child's daycare. Build confidence and character without leaving their routine.
              </p>

              {/* Feature list */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <Check className="h-5 w-5 text-[#2EC4B6]" />
                  <span>Age-appropriate curriculum for 3-7 year olds</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Check className="h-5 w-5 text-[#2EC4B6]" />
                  <span>Classes during daycare hours - no extra trips</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Check className="h-5 w-5 text-[#2EC4B6]" />
                  <span>Certified instructors with background checks</span>
                </div>
              </div>

              {/* CTA with shimmer effect */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link 
                  href="/waiver"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#2EC4B6] text-white font-semibold rounded-full overflow-hidden transition-all hover:shadow-lg hover:shadow-[#2EC4B6]/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Enroll Your Child</span>
                  <ArrowRight className="h-5 w-5 relative transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="#locations"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
                >
                  View Locations
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-12 flex gap-10">
                <div>
                  <div className="text-3xl font-bold text-white">100+</div>
                  <div className="text-sm text-white/50">Active Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.9</div>
                  <div className="text-sm text-white/50">Parent Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">3</div>
                  <div className="text-sm text-white/50">DFW Locations</div>
                </div>
              </div>
            </FadeIn>

            {/* Right - Floating Stacked Cards */}
            <FadeIn direction="up" delay={0.2} className="relative hidden lg:block">
              <div className="relative h-[500px]">
                {/* Card 1 - Back */}
                <div className="absolute top-0 right-0 w-72 transform rotate-6 hover:rotate-3 transition-transform duration-500">
                  <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#2EC4B6]/80 to-[#2EC4B6]/60 p-5 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80 text-sm font-medium">Little Grapplers</span>
                      <div className="h-8 w-8 rounded-full bg-white/20" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-wider mb-4">Dallas Location</div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-white/60 text-xs">STUDENTS</div>
                        <div className="text-white font-medium">35 Active</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">SCHEDULE</div>
                        <div className="text-white font-medium">M/W/F</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Middle */}
                <div className="absolute top-20 right-16 w-72 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
                  <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#F7931E]/80 to-[#F7931E]/60 p-5 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80 text-sm font-medium">Little Grapplers</span>
                      <div className="h-8 w-8 rounded-full bg-white/20" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-wider mb-4">Plano Location</div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-white/60 text-xs">STUDENTS</div>
                        <div className="text-white font-medium">28 Active</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">SCHEDULE</div>
                        <div className="text-white font-medium">T/TH</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Front */}
                <div className="absolute top-44 right-8 w-72 transform rotate-2 hover:-rotate-1 transition-transform duration-500 z-20">
                  <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#FFC857]/80 to-[#FFC857]/60 p-5 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#1F2A44]/80 text-sm font-medium">Little Grapplers</span>
                      <div className="h-8 w-8 rounded-full bg-[#1F2A44]/20" />
                    </div>
                    <div className="text-2xl font-bold text-[#1F2A44] tracking-wider mb-4">Richardson</div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-[#1F2A44]/60 text-xs">STUDENTS</div>
                        <div className="text-[#1F2A44] font-medium">22 Active</div>
                      </div>
                      <div>
                        <div className="text-[#1F2A44]/60 text-xs">SCHEDULE</div>
                        <div className="text-[#1F2A44] font-medium">M/W</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Feature Highlight Card */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Yellow Feature Card */}
            <FadeIn direction="up">
              <div className="relative overflow-hidden rounded-3xl bg-[#FFC857] p-8 md:p-10 min-h-[320px] group">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1F2A44]/10 rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#1F2A44]/5 rounded-full" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black text-[#1F2A44] leading-tight">
                    Building champions,<br />one child at a time.
                  </h2>
                  <p className="mt-4 text-[#1F2A44]/70 font-mono text-sm max-w-sm">
                    // Where every constraint is met with creativity and every child discovers their potential.
                  </p>
                  
                  <div className="mt-auto pt-12 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1F2A44]/50 uppercase tracking-wider">Status</div>
                      <div className="text-[#1F2A44] font-bold">Enrolling Now</div>
                    </div>
                    <Link 
                      href="/waiver"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2A44] text-white group-hover:scale-110 transition-transform"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Dark Feature Card */}
            <FadeIn direction="up" delay={0.1}>
              <div className="relative overflow-hidden rounded-3xl bg-[#1F2A44] p-8 md:p-10 min-h-[320px] group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/10 via-transparent to-[#F7931E]/10" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2EC4B6]/20 border border-[#2EC4B6]/30 mb-6">
                    <Shield className="h-3 w-3 text-[#2EC4B6]" />
                    <span className="text-xs font-medium text-[#2EC4B6]">Safe & Trusted</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Confidence through<br />
                    <span className="text-[#2EC4B6]">martial arts.</span>
                  </h2>
                  <p className="mt-4 text-white/50 text-sm max-w-sm">
                    Our program combines Brazilian Jiu-Jitsu fundamentals with character development, helping kids build self-esteem and discipline.
                  </p>
                  
                  <div className="mt-auto pt-8">
                    <Link 
                      href="/programs"
                      className="group/btn relative inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-full overflow-hidden border border-white/10 hover:border-[#2EC4B6]/50 transition-colors"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2EC4B6]/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      <span className="relative">Learn About Our Program</span>
                      <ArrowRight className="h-4 w-4 relative" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Locations Grid */}
      <section id="locations" className="py-16 md:py-24">
        <Container>
          <FadeIn direction="up" className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our <span className="text-[#2EC4B6]">Locations</span></h2>
            <p className="mt-3 text-white/50 max-w-2xl mx-auto">Select a location to learn more or enroll your child in our program.</p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {locations.map((location) => (
              <StaggerItem key={location.id}>
                <div className="group relative rounded-2xl overflow-hidden bg-[#1F2A44] border border-white/5 hover:border-white/20 transition-all duration-500">
                  {/* Image with overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={location.image}
                      alt={location.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A44] via-[#1F2A44]/50 to-transparent" />
                    
                    {/* Status badge */}
                    <div className="absolute top-4 left-4">
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold backdrop-blur-sm"
                        style={{ backgroundColor: `${location.color}CC` }}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        {location.area}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#2EC4B6] transition-colors">
                      {location.name}
                    </h3>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-white/40" />
                        <span className="text-white/60">{location.address.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-white/40" />
                        <span className="text-white/60">{location.schedule}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-white/40" />
                        <span className="text-white/60">{location.ageGroups}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                      <Link 
                        href="/waiver"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
                        style={{ backgroundColor: location.color, color: location.color === '#FFC857' ? '#1F2A44' : 'white' }}
                      >
                        Enroll
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link 
                        href={`/community/${location.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-all"
                      >
                        Community
                      </Link>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${location.color}15, transparent 40%)` 
                    }}
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#1F2A44] to-[#0a0f1a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2EC4B6]/10 rounded-full blur-[120px]" />
        
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Don't See Your{' '}
                <span className="text-[#2EC4B6]">Daycare?</span>
              </h2>
              <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
                We're actively expanding across the Dallas-Fort Worth area. Request Little Grapplers at your child's daycare and we'll work to make it happen.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/contact"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2EC4B6] text-white font-semibold rounded-full overflow-hidden transition-all hover:shadow-lg hover:shadow-[#2EC4B6]/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Request a Location</span>
                  <ArrowRight className="h-5 w-5 relative transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="tel:+14692095814"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
                >
                  <Phone className="h-5 w-5" />
                  (469) 209-5814
                </Link>
              </div>
            </FadeIn>

            {/* Trust indicators */}
            <FadeIn direction="up" delay={0.2} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                <Award className="h-8 w-8 text-[#2EC4B6] mx-auto" />
                <div className="mt-4 text-white font-bold">Expert Instructors</div>
                <div className="mt-2 text-white/50 text-sm">Certified BJJ professionals with child education experience</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                <Shield className="h-8 w-8 text-[#F7931E] mx-auto" />
                <div className="mt-4 text-white font-bold">Safe Environment</div>
                <div className="mt-2 text-white/50 text-sm">Background-checked staff and age-appropriate curriculum</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                <Calendar className="h-8 w-8 text-[#FFC857] mx-auto" />
                <div className="mt-4 text-white font-bold">Flexible Schedule</div>
                <div className="mt-2 text-white/50 text-sm">Classes that fit seamlessly into your child's routine</div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </div>
  );
}
