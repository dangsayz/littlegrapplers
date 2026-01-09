'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MapPin,
  Info,
  Phone,
  User,
  Users,
  MessageSquare,
  Settings,
  Video,
  LayoutDashboard,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ADMIN_EMAILS } from '@/lib/constants';
import { forwardRef, useState, useEffect, type ComponentPropsWithoutRef } from 'react';

// Clerk passes `component` prop to children which is invalid on native button elements
// This wrapper filters it out to prevent hydration mismatches
interface ClerkButtonProps extends ComponentPropsWithoutRef<'button'> {
  component?: string;
}

const ClerkButton = forwardRef<HTMLButtonElement, ClerkButtonProps>(
  ({ component, ...props }, ref) => <button ref={ref} {...props} />
);
ClerkButton.displayName = 'ClerkButton';


interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPaths?: string[];
  exactMatch?: boolean;
}

const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Locations', href: '/locations', icon: MapPin },
  { label: 'Contact', href: '/contact', icon: Phone },
];

const dashboardNavItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard, matchPaths: ['/dashboard'], exactMatch: true },
  { label: 'Students', href: '/dashboard/students', icon: Users, matchPaths: ['/dashboard/students'] },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, matchPaths: ['/dashboard/settings'] },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: Shield, matchPaths: ['/dashboard/admin'], exactMatch: true },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users, matchPaths: ['/dashboard/admin/users'] },
  { label: 'Videos', href: '/dashboard/admin/videos', icon: Video, matchPaths: ['/dashboard/admin/videos'] },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings, matchPaths: ['/dashboard/admin/settings'] },
];

const communityNavItems: NavItem[] = [
  { label: 'Threads', href: '', icon: MessageSquare, matchPaths: ['/community'] },
  { label: 'New Post', href: '', icon: MessageSquare, matchPaths: [] },
];

function NavItemButton({ 
  item, 
  isActive, 
  index,
  total 
}: { 
  item: NavItem; 
  isActive: boolean; 
  index: number;
  total: number;
}) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      aria-label={`Navigate to ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] rounded-2xl transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2',
        isActive 
          ? 'text-slate-900' 
          : 'text-slate-400 hover:text-slate-600 active:scale-95'
      )}
    >
      {/* Active background - subtle and minimal */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            layoutId="activeTab"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-slate-100/80 rounded-2xl"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
      </AnimatePresence>
      
      <Icon 
        className={cn(
          'relative z-10 h-[22px] w-[22px] transition-all duration-200',
          isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
        )} 
        aria-hidden="true" 
      />
      <span className={cn(
        'relative z-10 text-[10px] font-medium tracking-tight transition-all duration-200 whitespace-nowrap',
        isActive ? 'text-slate-900' : 'text-slate-400'
      )}>
        {item.label}
      </span>
    </Link>
  );
}

// Pages where bottom nav should be hidden
const HIDDEN_PATHS = [
  '/sign-in',
  '/sign-up',
  '/onboarding',
  '/waiver',
  '/inquiry',
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show on excluded pages
  const shouldHide = HIDDEN_PATHS.some(path => pathname.startsWith(path));
  if (shouldHide) {
    return null;
  }

  // Determine user context - only after mounted to prevent hydration mismatch
  const isSignedIn = mounted && isLoaded && !!user;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = mounted && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
  
  // Determine which nav set to show based on current route and user role
  const isAdminSection = pathname.startsWith('/dashboard/admin');
  const isDashboard = pathname.startsWith('/dashboard');
  const isCommunity = pathname.startsWith('/community');
  
  // Select appropriate nav items
  let navItems: NavItem[];
  if (isAdminSection && isAdmin) {
    navItems = adminNavItems;
  } else if (isDashboard || isCommunity) {
    navItems = dashboardNavItems;
  } else {
    navItems = publicNavItems;
  }
  
  // Route matching logic with exactMatch support
  const isActiveItem = (item: NavItem) => {
    // Exact match takes precedence
    if (item.exactMatch) {
      return pathname === item.href;
    }
    
    // Check matchPaths if provided
    if (item.matchPaths && item.matchPaths.length > 0) {
      return item.matchPaths.some(path => 
        path === pathname || (path !== '/' && pathname.startsWith(path + '/'))
      );
    }
    
    // Default: exact match for home, prefix match for others
    if (item.href === '/') {
      return pathname === '/';
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  // Determine if we should show extra action button
  const showSignIn = !isSignedIn && !isDashboard;
  const showPortal = isSignedIn && !isDashboard && !isCommunity;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-3 pb-2 safe-area-inset-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Apple-inspired floating nav bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        className={cn(
          'relative flex items-center justify-around',
          'bg-white/70 backdrop-blur-xl backdrop-saturate-150',
          'border border-white/20',
          'rounded-[28px]',
          'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]',
          'px-3 py-2.5'
        )}
      >
          
          {navItems.map((item, index) => (
            <NavItemButton
              key={item.href}
              item={item}
              isActive={isActiveItem(item)}
              index={index}
              total={navItems.length}
            />
          ))}

          {/* Account button for signed out users on public pages */}
          {showSignIn && (
            <SignedOut>
              <SignInButton mode="modal">
                <ClerkButton
                  aria-label="Sign in to your account"
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] rounded-2xl transition-all duration-200',
                    'text-slate-400 hover:text-slate-600 active:scale-95',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2'
                  )}
                >
                  <User className="h-[22px] w-[22px] stroke-[1.5px]" aria-hidden="true" />
                  <span className="text-[10px] font-medium tracking-tight text-slate-400">Sign In</span>
                </ClerkButton>
              </SignInButton>
            </SignedOut>
          )}

          {/* Dashboard shortcut for signed in users on public pages */}
          {showPortal && (
            <SignedIn>
              <Link
                href="/dashboard"
                aria-label="Go to your dashboard"
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[60px] rounded-2xl transition-all duration-200',
                  'text-slate-400 hover:text-slate-600 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2'
                )}
              >
                <LayoutDashboard className="h-[22px] w-[22px] stroke-[1.5px]" aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight text-slate-400">Portal</span>
              </Link>
            </SignedIn>
          )}

      </motion.nav>
    </div>
  );
}
