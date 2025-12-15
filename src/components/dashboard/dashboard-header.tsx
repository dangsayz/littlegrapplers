'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { UserButton } from '@clerk/nextjs';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  firstName?: string | null;
  lastName?: string | null;
}

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
  const displayName = firstName || 'Grappler';

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

          {/* User button */}
          <div className="flex items-center gap-4">
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
