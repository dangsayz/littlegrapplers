'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  FileCheck,
  Settings,
  ChevronLeft,
  Shield,
  Bell,
  ClipboardList,
  Video,
  UserPlus,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_EMAILS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems: Array<{ label: string; href: Route; icon: LucideIcon; hint: string }> = [
  {
    label: 'Home',
    href: '/dashboard' as Route,
    icon: LayoutDashboard,
    hint: 'Overview of your enrolled students',
  },
  {
    label: 'My Students',
    href: '/dashboard/students' as Route,
    icon: Users,
    hint: 'View and manage your children',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings' as Route,
    icon: Settings,
    hint: 'Update your account preferences',
  },
];

const adminNavItems: Array<{ label: string; href: Route; icon: LucideIcon; hint: string; badgeKey?: string }> = [
  {
    label: 'Enrollments',
    href: '/dashboard/admin/enrollments' as Route,
    icon: UserPlus,
    hint: 'Review and approve new applications',
    badgeKey: 'pendingEnrollments',
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications' as Route,
    icon: Bell,
    hint: 'View and manage system alerts',
    badgeKey: 'notifications',
  },
  {
    label: 'Video + Images',
    href: '/dashboard/admin/media' as Route,
    icon: Video,
    hint: 'Upload photos and videos for parents',
  },
  {
    label: 'Admin Panel',
    href: '/dashboard/admin' as Route,
    icon: Shield,
    hint: 'Manage users, waivers, and settings',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [badges, setBadges] = useState<{ pendingEnrollments: number; notifications: number }>({ pendingEnrollments: 0, notifications: 0 });
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const isAdmin = mounted && isLoaded && userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  // Fetch notification counts for admins
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/badge-counts');
        if (res.ok) {
          const data = await res.json();
          setBadges(data);
        }
      } catch (err) {
        console.error('Failed to fetch badge counts:', err);
      }
    };

    fetchBadges();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-slate-200/40 bg-gradient-to-b from-white/95 via-slate-50/90 to-sky-50/30 backdrop-blur-xl z-[100]" style={{ overflow: 'visible', clipPath: 'none' }}>
      {/* Decorative glass elements - cool tones only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-sky-200/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-32 h-32 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-20 -left-10 w-28 h-28 bg-gradient-to-tr from-violet-200/15 to-transparent rounded-full blur-2xl" />
      </div>
      
      {/* Logo / Back to Home */}
      <div className="relative flex items-center h-16 px-4 border-b border-white/30 bg-white/40 backdrop-blur-sm">
        <Button variant="ghost" size="sm" asChild className="gap-2 hover:bg-white/50">
          <Link href="/">
            <ChevronLeft className="h-4 w-4 text-[#2EC4B6]" />
            <span className="font-display font-semibold bg-gradient-to-r from-[#1F2A44] to-[#2EC4B6] bg-clip-text text-transparent">Little Grapplers</span>
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-1" style={{ overflow: 'visible' }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          const iconColors = ['text-sky-500', 'text-indigo-500', 'text-slate-500'];
          const iconColor = iconColors[navItems.indexOf(item) % iconColors.length];

          return (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm text-[#1F2A44]'
                    : 'text-[#1F2A44]/60 hover:bg-white/40 hover:text-[#1F2A44] border border-transparent'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                  isActive ? `bg-white/80 shadow-sm ${iconColor}` : 'bg-white/40 text-[#1F2A44]/50 group-hover:bg-white/60'
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
              </Link>
              {/* Soft tooltip hint */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1F2A44] text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-500 whitespace-nowrap z-[9999]">
                {item.hint}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1F2A44]" />
              </div>
            </div>
          );
        })}

        {/* Admin Section - Only visible to admin */}
        {isAdmin && (
          <>
            <div className="my-4 mx-2 border-t border-slate-300/40" />
            
            {/* Apple-style section header */}
            <div className="mb-3 px-2 pt-1">
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase bg-gradient-to-b from-slate-500 to-slate-400 bg-clip-text text-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                  Admin Tools
                </span>
            </div>
            
            <div className="space-y-1">
                {adminNavItems.map((item, index) => {
                  const isActive =
                    item.href === '/dashboard/admin'
                      ? pathname === '/dashboard/admin' || (pathname.startsWith('/dashboard/admin') && !pathname.startsWith('/dashboard/admin/media'))
                      : pathname.startsWith(item.href);

                  const adminIconColors = ['text-slate-500', 'text-slate-500', 'text-slate-500', 'text-sky-600'];
                  const iconColor = adminIconColors[index % adminIconColors.length];
                  
                  // Special styling for Admin Panel (last item)
                  const isAdminPanel = item.href === '/dashboard/admin';

                  return (
                    <div key={item.href} className={cn("group relative", isAdminPanel && "mt-2 pt-2 border-t border-slate-200/40")}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200',
                          isAdminPanel
                            ? cn(
                                'bg-white/60',
                                'shadow-sm',
                                'border border-slate-200/40 hover:border-slate-200/60',
                                'hover:bg-white/80',
                                isActive ? 'text-slate-800 font-semibold' : 'text-slate-700 font-medium'
                              )
                            : cn(
                                'font-medium',
                                isActive
                                  ? 'bg-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_1px_2px_rgba(255,255,255,0.8)] text-slate-700'
                                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                              ),
                          // Apple-style font
                        )}
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-7 h-7 rounded-lg transition-all',
                          isAdminPanel
                            ? 'bg-gradient-to-b from-sky-50 to-sky-100/80 text-sky-600 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05)]'
                            : isActive 
                              ? `bg-white/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ${iconColor}` 
                              : 'text-slate-400 group-hover:text-slate-500'
                        )}>
                          <item.icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        {item.label}
                        {/* Badge for notification count */}
                        {item.badgeKey && badges[item.badgeKey as keyof typeof badges] > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {badges[item.badgeKey as keyof typeof badges]}
                          </span>
                        )}
                      </Link>
                      {/* Soft tooltip hint */}
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1F2A44] text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-500 whitespace-nowrap z-[9999]">
                        {item.hint}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1F2A44]" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
