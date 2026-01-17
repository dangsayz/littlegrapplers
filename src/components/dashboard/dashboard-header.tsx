'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { UserButton } from '@clerk/nextjs';
import { Menu, X, ChevronLeft, ChevronDown, MapPin, LayoutDashboard, Shield, Church, Building2, GraduationCap, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { ADMIN_EMAILS } from '@/lib/constants';
import { PinVerificationDialog, getRememberedPin } from './pin-verification-dialog';

interface DashboardHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
}

const LOCATIONS = [
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church', address: '2301 Premier Dr, Plano, TX', icon: Church, color: 'bg-violet-500' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano', address: '3665 W President George Bush Hwy, Plano, TX', icon: Building2, color: 'bg-blue-500' },
  { id: 'pinnacle', name: 'Pinnacle at Montessori of St. Paul', slug: 'pinnacle-montessori', address: '2931 Parker Rd, Wylie, TX', icon: GraduationCap, color: 'bg-emerald-500' },
] as const;

const mobileNavItems: Array<{ label: string; href: Route }> = [
  { label: 'Dashboard', href: '/dashboard' as Route },
  { label: 'My Students', href: '/dashboard/students' as Route },
  { label: 'Memberships', href: '/dashboard/memberships' as Route },
  { label: 'Discussions', href: '/dashboard/discussions' as Route },
  { label: 'Billing', href: '/dashboard/billing' as Route },
  { label: 'Settings', href: '/dashboard/settings' as Route },
];

export function DashboardHeader({ firstName, lastName }: DashboardHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ slug: string; name: string } | null>(null);
  const [locationPins, setLocationPins] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = mounted && isLoaded && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
  const displayName = firstName || 'Grappler';

  const handleLocationClick = async (e: React.MouseEvent, location: typeof LOCATIONS[number]) => {
    e.preventDefault();
    setLocationsOpen(false);

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
    if (isAdmin && locationsOpen && Object.keys(locationPins).length === 0) {
      fetch('/api/admin/locations/pins')
        .then(res => res.json())
        .then(data => {
          if (data.pins) {
            setLocationPins(data.pins);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin, locationsOpen, locationPins]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Mobile menu button */}
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link href="/" className="font-display font-semibold text-sm">
              Little Grapplers
            </Link>
          </div>

          {/* Welcome message - hidden on mobile when menu is open */}
          <div className={cn('hidden lg:block', mobileMenuOpen && 'hidden')}>
            <h1 className="text-lg font-semibold">
              Welcome, <span className="text-brand">{displayName}</span>!
            </h1>
          </div>

          {/* Locations dropdown and User button */}
          <div className="flex items-center gap-4">
            {/* Locations Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setLocationsOpen(!locationsOpen)}
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] shadow-sm group-hover:shadow-md transition-shadow">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span className="absolute inset-0 rounded-md bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="hidden sm:inline">Locations</span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', locationsOpen && 'rotate-180')} />
              </button>

              {/* Apple-inspired dropdown */}
              <div
                className={cn(
                  'absolute right-0 top-full mt-3 w-80 rounded-2xl overflow-hidden',
                  'bg-white/95 backdrop-blur-xl border border-gray-200/50',
                  'shadow-xl shadow-black/10',
                  'transition-all duration-300 ease-out',
                  locationsOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
                )}
              >
                <div className="p-3">
                  {/* Main Actions */}
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setLocationsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                      </div>
                      <span>My Family</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setLocationsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-3 mx-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* Community Boards */}
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Community Boards
                  </p>
                  <div className="space-y-1">
                    {LOCATIONS.map((location) => {
                      const IconComponent = location.icon;
                      return (
                        <button
                          key={location.id}
                          onClick={(e) => handleLocationClick(e, location)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${location.color} flex-shrink-0`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                            <p className="text-xs text-gray-400 truncate">{location.address}</p>
                          </div>
                          {isAdmin && locationPins[location.slug] && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 flex-shrink-0">
                              <Key className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-mono text-gray-500">
                                {locationPins[location.slug]}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <span className="hidden sm:inline text-sm text-muted-foreground">
              {firstName} {lastName}
            </span>
            {mounted && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </header>

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

      {/* Mobile navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute top-16 left-0 right-0 bg-card border-b border-border p-4 space-y-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
