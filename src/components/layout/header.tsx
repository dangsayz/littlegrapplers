'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, MapPin, Shield, ArrowUpRight, LayoutDashboard, Key } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { NAV_LINKS, ADMIN_EMAILS } from '@/lib/constants';
import { PinVerificationDialog, getRememberedPin } from '@/components/dashboard/pin-verification-dialog';

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
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church', address: '2301 Premier Dr, Plano, TX' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano', address: '3665 W President George Bush Hwy, Plano, TX' },
  { id: 'pinnacle', name: 'Pinnacle at Montessori of St. Paul', slug: 'pinnacle-montessori', address: '2931 Parker Rd, Wylie, TX' },
] as const;


function LocationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ slug: string; name: string } | null>(null);
  const [locationPins, setLocationPins] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = mounted && isLoaded && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  const handleLocationClick = async (e: React.MouseEvent, location: typeof LOCATIONS[number]) => {
    e.preventDefault();
    setIsOpen(false);

    // Check if PIN is already verified via server
    try {
      const res = await fetch(`/api/locations/${location.slug}/verify-pin`);
      const data = await res.json();
      
      if (data.verified) {
        router.push(`/community/${location.slug}`);
        return;
      }
    } catch {
      // Continue to show PIN dialog on error
    }

    // Check if we have a remembered PIN and try auto-verify
    const rememberedPin = getRememberedPin(location.slug);
    if (rememberedPin) {
      try {
        const res = await fetch(`/api/locations/${location.slug}/verify-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: rememberedPin }),
        });
        
        if (res.ok) {
          router.push(`/community/${location.slug}`);
          return;
        }
      } catch {
        // Continue to show PIN dialog on error
      }
    }

    // Show PIN dialog
    setSelectedLocation({ slug: location.slug, name: location.name });
    setPinDialogOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAdmin && isOpen && Object.keys(locationPins).length === 0) {
      fetch('/api/admin/locations/pins')
        .then(res => res.json())
        .then(data => {
          if (data.pins) {
            setLocationPins(data.pins);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, isOpen, locationPins]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2A44]/70 hover:text-[#1F2A44] transition-colors">
          Dashboard
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

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
          'absolute right-0 top-full mt-4 w-72 rounded-2xl overflow-hidden',
          'bg-white/80 backdrop-blur-xl border border-white/60',
          'shadow-lg shadow-black/5',
          'transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-gray-50/30 pointer-events-none" />
        
        <div className="relative p-2">
          {/* My Dashboard - always shown for signed-in users */}
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-teal-50/80 hover:to-emerald-50/60 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm group-hover:shadow-md transition-shadow">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="group-hover:text-teal-700 transition-colors">My Family</span>
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-orange-50/60 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="group-hover:text-amber-700 transition-colors">Admin Panel</span>
            </Link>
          )}
          <div className="my-3 mx-4 border-t border-slate-200/60" />
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Community Boards
          </p>
          {LOCATIONS.map((location, index) => {
            const colors = [
              { gradient: 'from-sky-400 to-blue-500', hover: 'hover:from-sky-50/80 hover:to-blue-50/60', text: 'group-hover:text-sky-700' },
              { gradient: 'from-violet-400 to-purple-500', hover: 'hover:from-violet-50/80 hover:to-purple-50/60', text: 'group-hover:text-violet-700' },
              { gradient: 'from-rose-400 to-pink-500', hover: 'hover:from-rose-50/80 hover:to-pink-50/60', text: 'group-hover:text-rose-700' },
            ];
            const theme = colors[index % colors.length];
            
            return (
              <button
                key={location.id}
                onClick={(e) => handleLocationClick(e, location)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-gradient-to-r ${theme.hover} transition-all w-full text-left`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradient} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${theme.text} transition-colors truncate`}>{location.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{location.address}</p>
                </div>
                {isAdmin && locationPins[location.slug] && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/60">
                    <Key className="h-2.5 w-2.5 text-slate-400" />
                    <span className="text-[10px] font-mono font-medium text-slate-500 tracking-wide">
                      {locationPins[location.slug]}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PIN Verification Dialog */}
      {selectedLocation && (
        <PinVerificationDialog
          isOpen={pinDialogOpen}
          onClose={() => {
            setPinDialogOpen(false);
            setSelectedLocation(null);
          }}
          locationSlug={selectedLocation.slug}
          locationName={selectedLocation.name}
        />
      )}
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDashboardOpen, setIsMobileDashboardOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const isSignedIn = mounted && isLoaded && !!user;
  const firstName = user?.firstName || user?.username || 'User';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = mounted && isLoaded && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileDashboardOpen(false);
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
        {/* White background */}
        <div 
          className={cn(
            'absolute inset-0 bg-white transition-all duration-300',
            isScrolled && 'shadow-lg shadow-black/5'
          )} 
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-14">
            
            {/* Logo - Simplified */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              {/* LG Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#1FA89C] shadow-sm">
                <span className="text-[17px] font-bold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  LG
                </span>
              </div>
              
              {/* Text */}
              <div className="hidden sm:block">
                <span className="text-[17px] font-bold text-slate-800">Little </span>
                <span className="text-[17px] font-bold text-[#2EC4B6]">Grapplers</span>
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
              {isSignedIn ? (
                <>
                  <LocationDropdown />
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-9 h-9',
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="group relative px-4 py-2 text-sm font-medium text-[#1F2A44]/60 hover:text-[#1F2A44] transition-all duration-500"
                  >
                    <span className="relative z-10">Log in</span>
                    <span className="absolute bottom-1 left-1/2 w-0 h-[1px] bg-[#1F2A44]/40 group-hover:w-8 -translate-x-1/2 transition-all duration-500" />
                  </Link>
                  <Link 
                    href="/signup"
                    className="group relative px-6 py-2.5 rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F7931E] via-[#FFC857] to-[#F7931E] bg-[length:200%_100%] animate-shimmer" />
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-[#F7931E]/50 to-[#FFC857]/50 blur-xl" />
                    <span className="relative z-10 flex items-center gap-1.5 text-sm font-bold text-white">
                      Get Started
                      <ArrowUpRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </>
              )}
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
        <div className="flex flex-col h-full pt-24 pb-28 px-6">
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
            {isSignedIn ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10',
                      },
                    }}
                  />
                  <span className="text-sm text-[#1F2A44]/60">
                    <span className="text-[#2EC4B6] font-semibold">{firstName}</span>
                  </span>
                </div>
                
                {/* Go to Dashboard - Primary CTA */}
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center justify-center w-full py-4 rounded-xl bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] text-white font-bold hover:shadow-lg transition-all"
                >
                  <span className="text-lg">Go to My Dashboard</span>
                  <span className="text-xs font-normal opacity-90 mt-0.5">View students & complete enrollment</span>
                </Link>
                
                {/* Dashboard Dropdown for Community */}
                <button
                  onClick={() => setIsMobileDashboardOpen(!isMobileDashboardOpen)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all mt-2"
                >
                  Community Boards
                  <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isMobileDashboardOpen && 'rotate-180')} />
                </button>
                
                {/* Mobile Community Boards Menu */}
                <div className={cn(
                  'overflow-hidden transition-all duration-300',
                  isMobileDashboardOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                )}>
                  <div className="space-y-1 bg-slate-50/80 rounded-xl p-2">
                    {isAdmin && (
                      <Link
                        href="/dashboard/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-all"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        Admin Panel
                      </Link>
                    )}
                    
                    {LOCATIONS.map((location, index) => {
                      const colors = [
                        { gradient: 'from-sky-400 to-blue-500' },
                        { gradient: 'from-violet-400 to-purple-500' },
                        { gradient: 'from-rose-400 to-pink-500' },
                      ];
                      const theme = colors[index % colors.length];
                      
                      return (
                        <Link
                          key={location.id}
                          href={`/community/${location.slug}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-all"
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{location.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{location.address}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="block w-full py-3.5 rounded-xl border border-[#1F2A44]/20 text-[#1F2A44] font-semibold hover:bg-[#1F2A44]/5 transition-colors text-center"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F7931E] to-[#FFC857] text-white font-bold hover:shadow-lg transition-all text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header Spacer - not needed on home page which has full-bleed hero */}
      {pathname !== '/' && <div className="h-24" />}
    </>
  );
}
