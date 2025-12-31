'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MapPin,
  Info,
  Phone,
  HelpCircle,
  User,
  Users,
  MessageSquare,
  Settings,
  Video,
  LayoutDashboard,
  Shield,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

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
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
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
        'relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-2xl transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EC4B6] focus-visible:ring-offset-2',
        isActive 
          ? 'text-white' 
          : 'text-[#1F2A44]/50 hover:text-[#1F2A44]/70 active:scale-95'
      )}
    >
      {/* Active background pill */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            layoutId="activeTab"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-[#2EC4B6] to-[#8FE3CF] rounded-2xl shadow-lg shadow-[#2EC4B6]/30"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
      
      <Icon className={cn('relative z-10 h-5 w-5 transition-transform duration-300', isActive && 'scale-110')} aria-hidden="true" />
      <span className={cn(
        'relative z-10 text-[10px] font-semibold transition-all duration-300 whitespace-nowrap',
        isActive ? 'opacity-100' : 'opacity-70'
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
  
  // Don't show on excluded pages
  const shouldHide = HIDDEN_PATHS.some(path => pathname.startsWith(path));
  if (shouldHide) {
    return null;
  }

  // Determine user context
  const isSignedIn = isLoaded && !!user;
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;
  
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
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Gradient fade effect above nav */}
      <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" aria-hidden="true" />
      
      {/* Floating island container */}
      <div className="px-4 pb-4">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className={cn(
            'relative flex items-center justify-around',
            'bg-white/95 backdrop-blur-xl',
            'rounded-[28px] shadow-2xl shadow-black/10',
            'border border-[#1F2A44]/5',
            'px-2 py-1',
            'mx-auto max-w-md'
          )}
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-[1px] rounded-[27px] bg-gradient-to-b from-white/50 to-transparent pointer-events-none" aria-hidden="true" />
          
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
                <button
                  aria-label="Sign in to your account"
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-2xl transition-all duration-300',
                    'text-[#1F2A44]/50 hover:text-[#1F2A44]/70 active:scale-95',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EC4B6] focus-visible:ring-offset-2'
                  )}
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-semibold opacity-70">Sign In</span>
                </button>
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
                  'relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-2xl transition-all duration-300',
                  'text-[#1F2A44]/50 hover:text-[#1F2A44]/70 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EC4B6] focus-visible:ring-offset-2'
                )}
              >
                <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-semibold opacity-70">Portal</span>
              </Link>
            </SignedIn>
          )}

        </motion.nav>
      </div>
    </div>
  );
}
