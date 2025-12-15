'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

/**
 * NavLink with magnetic hover effect
 * Purpose: Creates playful, engaging interaction that feels alive
 * Motion: GPU-accelerated transforms with spring-like easing
 */
function NavLink({
  href,
  children,
  isActive,
}: {
  href: (typeof NAV_LINKS)[number]['href'];
  children: React.ReactNode;
  isActive: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      ref={linkRef}
      href={href as typeof NAV_LINKS[number]['href']}
      className="group relative px-3 py-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover background pill */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          'transition-all duration-[var(--motion-fast)]',
          '[transition-timing-function:var(--ease-out-expo)]',
          isActive
            ? 'bg-brand/15 scale-100'
            : isHovered
              ? 'bg-foreground/5 scale-100'
              : 'bg-transparent scale-95 opacity-0'
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'relative z-10 text-sm font-medium transition-colors',
          'duration-[var(--motion-fast)]',
          isActive
            ? 'text-brand'
            : 'text-foreground/70 group-hover:text-foreground'
        )}
      >
        {children}
      </span>
      {/* Active dot indicator */}
      {isActive && (
        <span
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll position for header background with RAF for smoothness
  useEffect(() => {
    let rafId: number;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if ((currentScrollY > 50) !== (lastScrollY > 50)) {
          setIsScrolled(currentScrollY > 50);
        }
        lastScrollY = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* CSS for header animations - GPU accelerated */}
      <style jsx global>{`
        @keyframes header-float-in {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(46, 196, 182, 0.3),
                        0 0 40px rgba(46, 196, 182, 0.1);
          }
          50% {
            box-shadow: 0 0 25px rgba(46, 196, 182, 0.4),
                        0 0 50px rgba(46, 196, 182, 0.2);
          }
        }
        
        .nav-pill {
          animation: header-float-in 0.6s var(--ease-out-expo) forwards;
        }
        
        .cta-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes mobile-menu-item-enter {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .mobile-menu-item {
          opacity: 0;
          animation: mobile-menu-item-enter var(--motion-normal) var(--ease-out-expo) forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .nav-pill,
          .mobile-menu-item {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .cta-glow {
            animation: none;
          }
        }
      `}</style>

      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-50 pointer-events-none"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Floating Pill Nav Container */}
          <nav
            className={cn(
              'pointer-events-auto relative mx-auto flex items-center justify-between',
              'rounded-full px-2 py-1.5',
              'transition-all duration-[var(--motion-normal)]',
              '[transition-timing-function:var(--ease-out-expo)]',
              hasMounted ? 'nav-pill' : 'opacity-0',
              isScrolled
                ? 'max-w-4xl bg-background/90 backdrop-blur-xl shadow-xl shadow-black/10'
                : 'max-w-5xl bg-background/60 backdrop-blur-md'
            )}
          >

            {/* Logo - Left side */}
            <div className="flex-shrink-0 pl-3">
              <Logo size="sm" />
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  isActive={pathname === link.href}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA - Right side */}
            <div className="hidden items-center gap-2 pr-1 lg:flex">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full text-sm font-medium text-foreground/70',
                      'transition-all duration-[var(--motion-fast)]',
                      '[transition-timing-function:var(--ease-out-expo)]',
                      'hover:text-foreground hover:bg-foreground/5'
                    )}
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    variant="brand"
                    size="sm"
                    className={cn(
                      'rounded-full px-5 font-semibold',
                      'transition-all duration-[var(--motion-fast)]',
                      '[transition-timing-function:var(--ease-out-expo)]',
                      'hover:scale-105 active:scale-95',
                      isScrolled && 'cta-glow'
                    )}
                  >
                    Start Free
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  variant="brand"
                  size="sm"
                  asChild
                  className={cn(
                    'rounded-full px-5 font-semibold',
                    'transition-all duration-[var(--motion-fast)]',
                    '[transition-timing-function:var(--ease-out-expo)]',
                    'hover:scale-105 active:scale-95'
                  )}
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'lg:hidden relative overflow-hidden rounded-full h-9 w-9 mr-1',
                'bg-foreground/5 hover:bg-foreground/10'
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'transition-all duration-[var(--motion-fast)]',
                  '[transition-timing-function:var(--ease-out-expo)]',
                  isMobileMenuOpen
                    ? 'rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                )}
              >
                <Menu className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'transition-all duration-[var(--motion-fast)]',
                  '[transition-timing-function:var(--ease-out-expo)]',
                  isMobileMenuOpen
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                )}
              >
                <X className="h-5 w-5" />
              </span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay - Smooth fade with motion tokens */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-[var(--motion-normal)]',
          '[transition-timing-function:var(--ease-out-expo)]',
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel - Slide with spring-like easing */}
      <div
        className={cn(
          'fixed right-0 top-0 z-40 h-full w-full max-w-sm',
          'bg-background shadow-2xl lg:hidden',
          'transition-transform duration-[var(--motion-normal)]',
          '[transition-timing-function:var(--ease-out-expo)]',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-sm font-medium text-muted-foreground">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className={cn(
              'transition-transform duration-[var(--motion-fast)]',
              '[transition-timing-function:var(--ease-out-expo)]',
              'hover:rotate-90'
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Staggered nav items - 50ms intervals per motion system */}
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative rounded-xl px-4 py-3.5 text-lg font-medium',
                'transition-colors duration-[var(--motion-fast)]',
                '[transition-timing-function:var(--ease-out-expo)]',
                pathname === link.href
                  ? 'bg-brand/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'
              )}
              style={{
                animationDelay: isMobileMenuOpen ? `${(index + 1) * 50}ms` : '0ms',
              }}
            >
              {link.label}
              {/* Active indicator dot */}
              {pathname === link.href && (
                <span
                  className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA buttons with stagger */}
        <div className="mt-8 flex flex-col gap-3 px-4">
          <SignedOut>
            <div
              className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
              style={{
                animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 1) * 50}ms` : '0ms',
              }}
            >
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    'w-full transition-all duration-[var(--motion-fast)]',
                    '[transition-timing-function:var(--ease-out-expo)]',
                    'hover:scale-[1.01] active:scale-[0.99]'
                  )}
                >
                  Sign In
                </Button>
              </SignInButton>
            </div>
            <div
              className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
              style={{
                animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 2) * 50}ms` : '0ms',
              }}
            >
              <SignUpButton mode="modal">
                <Button
                  variant="brand"
                  size="lg"
                  className={cn(
                    'w-full transition-all duration-[var(--motion-fast)]',
                    '[transition-timing-function:var(--ease-out-expo)]',
                    'hover:scale-[1.01] active:scale-[0.99]'
                  )}
                >
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div
              className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
              style={{
                animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 1) * 50}ms` : '0ms',
              }}
            >
              <Button
                variant="brand"
                size="lg"
                asChild
                className={cn(
                  'w-full transition-all duration-[var(--motion-fast)]',
                  '[transition-timing-function:var(--ease-out-expo)]',
                  'hover:scale-[1.01] active:scale-[0.99]'
                )}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
            <div
              className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
              style={{
                animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 2) * 50}ms` : '0ms',
              }}
            >
              <div className="flex items-center justify-center gap-3 py-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                />
                <span className="text-sm text-muted-foreground">Manage Account</span>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Spacer for floating header - accounts for py-4 + nav height */}
      <div className="h-20" />
    </>
  );
}
