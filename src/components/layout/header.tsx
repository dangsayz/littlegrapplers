'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, MapPin, Shield, ArrowUpRight } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';

const LOCATIONS = [
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano' },
  { id: 'pinnacle', name: 'Pinnacle at Montessori', slug: 'pinnacle-montessori' },
] as const;

const ADMIN_EMAIL = 'dangzr1@gmail.com';

function LocationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

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
        className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
      >
        Dashboard
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-4 w-64 rounded-2xl overflow-hidden',
          'bg-[#141414] border border-white/10',
          'shadow-2xl',
          'transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="p-2">
          {isAdmin && (
            <>
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
              >
                <Shield className="h-4 w-4 text-[#2EC4B6]" />
                Admin Panel
              </Link>
              <div className="my-2 border-t border-white/10" />
            </>
          )}
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Locations
          </p>
          {LOCATIONS.map((location) => (
            <Link
              key={location.id}
              href={`/community/${location.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled ? 'py-3' : 'py-4'
        )}
      >
        {/* Background blur layer - always visible with subtle background */}
        <div 
          className={cn(
            'absolute inset-0 transition-all duration-500',
            isScrolled 
              ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10' 
              : 'bg-[#0a0a0a]/60 backdrop-blur-md'
          )} 
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EC4B6] group-hover:scale-105 transition-transform">
                <span className="text-lg font-black text-white">LG</span>
              </div>
              <span className="hidden sm:block text-lg font-bold text-white">
                Little Grapplers
              </span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative px-4 py-2"
                  >
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors duration-300',
                        isActive ? 'text-white' : 'text-white/50 group-hover:text-white'
                      )}
                    >
                      {link.label}
                    </span>
                    {/* Animated underline */}
                    <span
                      className={cn(
                        'absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] rounded-full transition-all duration-300 origin-left',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA - Right */}
            <div className="hidden lg:flex items-center gap-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-semibold overflow-hidden transition-transform hover:scale-105">
                    <span className="relative z-10">Get Started</span>
                    <ArrowUpRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Get Started</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
                      avatarBox: 'w-9 h-9 ring-2 ring-white/10 hover:ring-[#2EC4B6]/50 transition-all',
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-4">
                <span 
                  className={cn(
                    'absolute left-0 w-5 h-[2px] bg-white transition-all duration-300',
                    isMobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                  )} 
                />
                <span 
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-5 h-[2px] bg-white transition-all duration-300',
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  )} 
                />
                <span 
                  className={cn(
                    'absolute left-0 w-5 h-[2px] bg-white transition-all duration-300',
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
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm bg-[#0a0a0a] lg:hidden transition-transform duration-500 ease-out',
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
                    'block px-4 py-4 rounded-xl text-lg font-medium transition-all',
                    isActive 
                      ? 'bg-[#2EC4B6]/10 text-[#2EC4B6]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                  style={{ transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : '0ms' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTAs */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full py-3.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full py-3.5 rounded-xl bg-[#2EC4B6] text-white font-semibold hover:bg-[#2EC4B6]/90 transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                Locations
              </p>
              {LOCATIONS.map((location) => (
                <Link
                  key={location.id}
                  href={`/community/${location.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                  <MapPin className="h-4 w-4 text-[#2EC4B6]" />
                  {location.name}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/10">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                />
                <span className="text-sm text-white/50">Manage Account</span>
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
