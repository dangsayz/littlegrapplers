'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { UserButton } from '@clerk/nextjs';
import { Menu, X, ChevronLeft, ChevronDown, MapPin, LayoutDashboard, Shield, Church, Building2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { ADMIN_EMAILS } from '@/lib/constants';

interface DashboardHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
}

const LOCATIONS = [
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church', icon: Church, color: 'bg-violet-500' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano', icon: Building2, color: 'bg-blue-500' },
  { id: 'pinnacle', name: 'Pinnacle at Montessori', slug: 'pinnacle-montessori', icon: GraduationCap, color: 'bg-emerald-500' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoaded } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = mounted && isLoaded && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
  const displayName = firstName || 'Grappler';

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                onClick={() => setLocationsOpen(!locationsOpen)}
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] shadow-sm group-hover:shadow-md transition-shadow">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span className="absolute inset-0 rounded-md bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                Locations
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
                      className="group flex items-center gap-4 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-900 hover:bg-gray-100/80 transition-all"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                      </div>
                      <span>My Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setLocationsOpen(false)}
                        className="group flex items-center gap-4 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-900 hover:bg-gray-100/80 transition-all"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                          <Shield className="h-5 w-5 text-white" />
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
                        <Link
                          key={location.id}
                          href={`/community/${location.slug}`}
                          onClick={() => setLocationsOpen(false)}
                          className="group flex items-center gap-4 px-3 py-3 rounded-xl text-[15px] font-medium text-gray-900 hover:bg-gray-100/80 transition-all"
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${location.color} shadow-sm`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="truncate">{location.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <span className="hidden sm:inline text-sm text-muted-foreground">
              {firstName} {lastName}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

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
