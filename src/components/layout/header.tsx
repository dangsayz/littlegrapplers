'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Container } from './container';
import { Logo } from './logo';

/**
 * NavLink with animated underline indicator
 * Purpose: Guides user attention, reveals interactive state
 * Motion: GPU-accelerated scaleX transform with --ease-out-expo
 */
function NavLink({
  href,
  children,
  isActive,
  index,
}: {
  href: (typeof NAV_LINKS)[number]['href'];
  children: React.ReactNode;
  isActive: boolean;
  index: number;
}) {
  return (
    <Link
      href={href as typeof NAV_LINKS[number]['href']}
      className="group relative px-4 py-2"
      style={{
        // Staggered entrance: 50ms intervals per motion system
        animationDelay: `${index * 50}ms`,
      }}
    >
      <span
        className={cn(
          'relative z-10 text-sm font-medium transition-colors',
          'duration-[var(--motion-fast)]',
          isActive
            ? 'text-foreground'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      >
        {children}
      </span>
      {/* Animated underline - GPU accelerated via transform */}
      <span
        className={cn(
          'absolute bottom-1 left-4 right-4 h-[2px] rounded-full',
          'origin-left bg-brand',
          'transition-transform duration-[var(--motion-fast)]',
          '[transition-timing-function:var(--ease-out-expo)]',
          isActive
            ? 'scale-x-100'
            : 'scale-x-0 group-hover:scale-x-100'
        )}
        aria-hidden="true"
      />
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
    setHasMounted(true);
  }, []);

  // Track scroll position for header background with RAF for smoothness
  useEffect(() => {
    let rafId: number;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if ((currentScrollY > 10) !== (lastScrollY > 10)) {
          setIsScrolled(currentScrollY > 10);
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
        @keyframes nav-fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-item-enter {
          opacity: 0;
          animation: nav-fade-in var(--motion-normal) var(--ease-out-expo) forwards;
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
          .nav-item-enter,
          .mobile-menu-item {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <header
        ref={headerRef}
        className={cn(
          'fixed left-0 right-0 top-0 z-50',
          // GPU-accelerated transitions using motion tokens
          'transition-[background-color,box-shadow,backdrop-filter]',
          'duration-[var(--motion-normal)]',
          '[transition-timing-function:var(--ease-out-expo)]',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-transparent'
        )}
      >
        <Container>
          <nav className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Logo variant={isScrolled ? 'default' : 'default'} />

            {/* Desktop Navigation - Staggered entrance animation */}
            <div className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((link, index) => (
                <div
                  key={link.href}
                  className={hasMounted ? 'nav-item-enter' : 'opacity-0'}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <NavLink
                    href={link.href}
                    isActive={pathname === link.href}
                    index={index}
                  >
                    {link.label}
                  </NavLink>
                </div>
              ))}
            </div>

            {/* Desktop CTA - Staggered entrance */}
            <div className="hidden items-center gap-3 lg:flex">
              <div
                className={hasMounted ? 'nav-item-enter' : 'opacity-0'}
                style={{ animationDelay: `${(NAV_LINKS.length + 1) * 50}ms` }}
              >
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    'transition-all duration-[var(--motion-fast)]',
                    '[transition-timing-function:var(--ease-out-expo)]',
                    'hover:bg-muted/80'
                  )}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
              <div
                className={hasMounted ? 'nav-item-enter' : 'opacity-0'}
                style={{ animationDelay: `${(NAV_LINKS.length + 2) * 50}ms` }}
              >
                <Button
                  asChild
                  className={cn(
                    'transition-all duration-[var(--motion-fast)]',
                    '[transition-timing-function:var(--ease-out-expo)]',
                    'hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button - Animated icon transition */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'lg:hidden relative overflow-hidden',
                hasMounted ? 'nav-item-enter' : 'opacity-0'
              )}
              style={{ animationDelay: '100ms' }}
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
                <Menu className="h-6 w-6" />
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
                <X className="h-6 w-6" />
              </span>
            </Button>
          </nav>
        </Container>
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
          <div
            className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
            style={{
              animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 1) * 50}ms` : '0ms',
            }}
          >
            <Button
              variant="outline"
              size="lg"
              asChild
              className={cn(
                'w-full transition-all duration-[var(--motion-fast)]',
                '[transition-timing-function:var(--ease-out-expo)]',
                'hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <div
            className={isMobileMenuOpen ? 'mobile-menu-item' : 'opacity-0'}
            style={{
              animationDelay: isMobileMenuOpen ? `${(NAV_LINKS.length + 2) * 50}ms` : '0ms',
            }}
          >
            <Button
              size="lg"
              asChild
              className={cn(
                'w-full transition-all duration-[var(--motion-fast)]',
                '[transition-timing-function:var(--ease-out-expo)]',
                'hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
