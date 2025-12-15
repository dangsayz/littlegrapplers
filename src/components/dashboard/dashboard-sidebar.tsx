'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems: Array<{ label: string; href: Route; icon: LucideIcon }> = [
  {
    label: 'Dashboard',
    href: '/dashboard' as Route,
    icon: LayoutDashboard,
  },
  {
    label: 'My Students',
    href: '/dashboard/students' as Route,
    icon: Users,
  },
  {
    label: 'Memberships',
    href: '/dashboard/memberships' as Route,
    icon: FileText,
  },
  {
    label: 'Discussions',
    href: '/dashboard/discussions' as Route,
    icon: MessageSquare,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing' as Route,
    icon: CreditCard,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings' as Route,
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-border bg-card">
      {/* Logo / Back to Home */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="font-display font-semibold">Little Grapplers</span>
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
