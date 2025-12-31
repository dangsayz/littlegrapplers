'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, MapPin, Shield, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';

// Magnetic button effect hook
function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }, [strength]);
  
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  }, []);
  
  return { ref, handleMouseMove, handleMouseLeave };
}

// Animated nav link component
function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  const { ref, handleMouseMove, handleMouseLeave } = useMagnetic(0.2);
  
  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative px-4 py-2 text-sm font-medium transition-all duration-500 ease-out',
        isActive ? 'text-[#2EC4B6]' : 'text-[#1F2A44]/60 hover:text-[#1F2A44]'
      )}
    >
      <span className="relative z-10">{label}</span>
      {/* Hover underline animation */}
      <span 
        className={cn(
          'absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] rounded-full transition-all duration-500 ease-out',
          isActive 
            ? 'w-6 -translate-x-1/2 opacity-100' 
            : 'w-0 -translate-x-1/2 opacity-0 group-hover:w-6 group-hover:opacity-100'
        )} 
      />
      {/* Subtle background glow on hover */}
      <span 
        className="absolute inset-0 rounded-full bg-[#2EC4B6]/0 group-hover:bg-[#2EC4B6]/5 transition-all duration-500 ease-out" 
      />
    </Link>
  );
}

const LOCATIONS = [
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano' },
  { id: 'pinnacle', name: 'Pinnacle at Montessori', slug: 'pinnacle-montessori' },
] as const;

const ADMIN_EMAIL = 'dangzr1@gmail.com';

function LocationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();
  const isAdmin = mounted && isLoaded && user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2A44]/70 hover:text-[#1F2A44] transition-colors"
      >
        Dashboard
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-4 w-64 rounded-2xl overflow-hidden',
          'bg-white border border-[#1F2A44]/10',
          'shadow-xl shadow-black/10',
          'transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="p-2">
          {/* My Dashboard - always shown for signed-in users */}
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2A44] hover:bg-[#2EC4B6]/10 hover:text-[#2EC4B6] transition-all"
          >
            <LayoutDashboard className="h-4 w-4 text-[#2EC4B6]" />
            My Dashboard
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2A44]/70 hover:bg-[#2EC4B6]/10 hover:text-[#2EC4B6] transition-all"
            >
              <Shield className="h-4 w-4 text-[#F7931E]" />
              Admin Panel
            </Link>
          )}
          <div className="my-2 border-t border-[#1F2A44]/10" />
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F2A44]/40">
            Community Boards
          </p>
          {LOCATIONS.map((location) => (
            <Link
              key={location.id}
              href={`/community/${location.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2A44]/70 hover:bg-[#2EC4B6]/10 hover:text-[#2EC4B6] transition-all"
            >
              <MapPin className="h-4 w-4 text-[#2EC4B6]" />
              {location.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'py-2' : 'py-4'
        )}
      >
        {/* Light glass background */}
        <div 
          className={cn(
            'absolute inset-0 transition-all duration-300',
            'bg-white/95 backdrop-blur-2xl',
            isScrolled && 'shadow-lg shadow-black/5'
          )} 
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              {/* Apple-inspired LG Logo */}
              <div className="relative">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Main logo container - clean rounded square */}
                <div className="relative flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#2EC4B6] to-[#1FA89C] shadow-lg group-hover:shadow-xl group-hover:shadow-[#2EC4B6]/30 transition-all duration-500 group-hover:scale-[1.02]">
                  {/* Inner highlight - Apple glass effect */}
                  <div className="absolute inset-0 rounded-[13px] bg-gradient-to-b from-white/25 to-transparent" style={{ height: '50%' }} />
                  
                  {/* LG Text - clean SF-style typography */}
                  <span className="relative text-[18px] font-bold tracking-tight text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', letterSpacing: '-0.02em' }}>
                    LG
                  </span>
                </div>
              </div>
              
              {/* Text with playful animation */}
              <div className="hidden sm:flex flex-col overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-[16px] font-extrabold text-[#1F2A44] leading-tight tracking-tight group-hover:tracking-normal transition-all duration-500">
                    Little
                  </span>
                  <span className="text-[16px] font-extrabold bg-gradient-to-r from-[#2EC4B6] to-[#F7931E] bg-clip-text text-transparent leading-tight">
                    Grapplers
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#F7931E] font-bold tracking-[0.12em] uppercase">
                    Youth BJJ
                  </span>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#2EC4B6] group-hover:animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-[#FFC857] group-hover:animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-1 rounded-full bg-[#FF5A5F] group-hover:animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    isActive={pathname === link.href}
                  />
                ))}
              </div>
            </div>

            {/* Desktop CTA - Right */}
            <div className="hidden lg:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="group relative px-4 py-2 text-sm font-medium text-[#1F2A44]/60 hover:text-[#1F2A44] transition-all duration-500">
                    <span className="relative z-10">Log in</span>
                    <span className="absolute bottom-1 left-1/2 w-0 h-[1px] bg-[#1F2A44]/40 group-hover:w-8 -translate-x-1/2 transition-all duration-500" />
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="group relative px-6 py-2.5 rounded-full overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7931E] via-[#FFC857] to-[#F7931E] bg-[length:200%_100%] animate-shimmer" />
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#F7931E]/50 to-[#FFC857]/50 blur-xl" />
                    <span className="relative z-10 flex items-center gap-1.5 text-sm font-bold text-white">
                      Get Started
                      <ArrowUpRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <LocationDropdown />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 ring-2 ring-[#2EC4B6]/20 hover:ring-[#2EC4B6]/50 transition-all',
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2A44]/10 bg-[#1F2A44]/5 hover:bg-[#1F2A44]/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-4">
                <span 
                  className={cn(
                    'absolute left-0 w-5 h-[2px] bg-[#1F2A44] rounded-full transition-all duration-300',
                    isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                  )} 
                />
                <span 
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-5 h-[2px] bg-[#1F2A44] rounded-full transition-all duration-300',
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  )} 
                />
                <span 
                  className={cn(
                    'absolute left-0 w-5 h-[2px] bg-[#1F2A44] rounded-full transition-all duration-300',
                    isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
                  )} 
                />
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm bg-white lg:hidden transition-transform duration-500 ease-out shadow-2xl',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6">
          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {NAV_LINKS.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-4 rounded-xl text-lg font-semibold transition-all',
                    isActive 
                      ? 'bg-[#2EC4B6]/10 text-[#2EC4B6]' 
                      : 'text-[#1F2A44]/70 hover:bg-[#1F2A44]/5 hover:text-[#1F2A44]'
                  )}
                  style={{ transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : '0ms' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTAs */}
          <div className="space-y-3 pt-6 border-t border-[#1F2A44]/10">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full py-3.5 rounded-xl border border-[#1F2A44]/20 text-[#1F2A44] font-semibold hover:bg-[#1F2A44]/5 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F7931E] to-[#FFC857] text-white font-bold hover:shadow-lg transition-all">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F2A44]/40 mb-3">
                Locations
              </p>
              {LOCATIONS.map((location) => (
                <Link
                  key={location.id}
                  href={`/community/${location.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2A44]/70 hover:bg-[#2EC4B6]/10 hover:text-[#2EC4B6] transition-all"
                >
                  <MapPin className="h-4 w-4 text-[#2EC4B6]" />
                  {location.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#1F2A44]/10">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                />
                <span className="text-sm text-[#1F2A44]/60">Manage Account</span>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Header Spacer */}
      <div className="h-24" />
    </>
  );
}
