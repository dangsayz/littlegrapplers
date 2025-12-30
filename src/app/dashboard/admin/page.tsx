import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import type { Route } from 'next';
import { 
  Settings, 
  MapPin, 
  MessageSquare, 
  Users, 
  FileText,
  FileCheck,
  ArrowRight,
  Shield,
  Mail,
  DollarSign,
  Video,
  Megaphone,
  Send,
  GraduationCap,
  CreditCard,
  Activity,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminPage() {
  const user = await currentUser();
  
  // Check if user is the admin
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch dynamic stats
  const [locationsRes, threadsRes, usersRes, contactsRes, waiversRes, newsletterRes] = await Promise.all([
    supabaseAdmin.from('locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('discussion_threads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabaseAdmin.from('signed_waivers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const stats = {
    locations: locationsRes.count || 0,
    threads: threadsRes.count || 0,
    users: usersRes.count || 0,
    unreadContacts: contactsRes.count || 0,
    students: waiversRes.count || 0,
    subscribers: newsletterRes.count || 0,
  };

  const adminSections = [
    {
      title: 'Financials',
      description: 'Revenue, memberships, and payments',
      icon: DollarSign,
      href: '/dashboard/admin/financials',
      color: 'text-green-600',
      stat: `${stats.students} students`,
    },
    {
      title: 'Students',
      description: 'View all enrolled students',
      icon: GraduationCap,
      href: '/dashboard/admin/students',
      color: 'text-indigo-500',
      stat: `${stats.students} enrolled`,
    },
    {
      title: 'Waivers',
      description: 'View signed enrollment waivers',
      icon: FileCheck,
      href: '/dashboard/admin/waivers',
      color: 'text-teal-500',
      stat: `${stats.students} signed`,
    },
    {
      title: 'Memberships',
      description: 'Manage contracts and billing',
      icon: CreditCard,
      href: '/dashboard/admin/memberships',
      color: 'text-emerald-500',
      stat: 'View all',
    },
    {
      title: 'Locations',
      description: 'Manage location PINs and settings',
      icon: MapPin,
      href: '/dashboard/admin/locations',
      color: 'text-blue-500',
      stat: `${stats.locations} active`,
    },
    {
      title: 'Users',
      description: 'View and manage registered users',
      icon: Users,
      href: '/dashboard/admin/users',
      color: 'text-purple-500',
      stat: `${stats.users} registered`,
    },
    {
      title: 'Community',
      description: 'Moderate discussions and threads',
      icon: MessageSquare,
      href: '/dashboard/admin/community',
      color: 'text-green-500',
      stat: `${stats.threads} threads`,
    },
    {
      title: 'Announcements',
      description: 'Create and manage announcements',
      icon: Megaphone,
      href: '/dashboard/admin/announcements',
      color: 'text-yellow-600',
      stat: 'Manage',
    },
    {
      title: 'Videos',
      description: 'Manage technique video library',
      icon: Video,
      href: '/dashboard/admin/videos',
      color: 'text-red-500',
      stat: 'Manage',
    },
    {
      title: 'Newsletter',
      description: 'Manage email subscribers',
      icon: Mail,
      href: '/dashboard/admin/newsletter',
      color: 'text-pink-500',
      stat: `${stats.subscribers} subscribers`,
    },
    {
      title: 'Email',
      description: 'Send emails and campaigns',
      icon: Send,
      href: '/dashboard/admin/email',
      color: 'text-cyan-500',
      stat: 'Compose',
    },
    {
      title: 'Contact Inbox',
      description: 'View contact form submissions',
      icon: Inbox,
      href: '/dashboard/admin/contacts',
      color: 'text-orange-500',
      stat: stats.unreadContacts > 0 ? `${stats.unreadContacts} unread` : 'All read',
    },
    {
      title: 'Activity Log',
      description: 'View system activity and audit trail',
      icon: Activity,
      href: '/dashboard/admin/activity',
      color: 'text-slate-500',
      stat: 'View logs',
    },
    {
      title: 'Settings',
      description: 'Global site settings',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'text-gray-500',
      stat: 'Configure',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          <Shield className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage your Little Grapplers platform
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Students</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Locations</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.locations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Users</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Threads</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.threads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-pink-500" />
              <span className="text-sm text-muted-foreground">Subscribers</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.subscribers}</div>
          </CardContent>
        </Card>
        <Card className={stats.unreadContacts > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Inbox className={`h-4 w-4 ${stats.unreadContacts > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">Unread</span>
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.unreadContacts > 0 ? 'text-orange-500' : ''}`}>{stats.unreadContacts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections.map((section) => (
          <Card key={section.title} className="hover:border-brand/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{section.stat}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={section.href as Route}>
                    Manage
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
