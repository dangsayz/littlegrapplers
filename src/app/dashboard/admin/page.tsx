import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import type { Route } from 'next';
import { 
  MapPin, 
  Users, 
  FileCheck,
  ArrowRight,
  Shield,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

// Pastel gradient configurations for admin cards - Apple glass aesthetic
const cardThemes = {
  financials: { gradient: 'from-emerald-400 to-teal-500', bg: 'from-emerald-50/80 via-teal-50/60 to-cyan-50/40' },
  students: { gradient: 'from-indigo-400 to-violet-500', bg: 'from-indigo-50/80 via-violet-50/60 to-purple-50/40' },
  waivers: { gradient: 'from-teal-400 to-cyan-500', bg: 'from-teal-50/80 via-cyan-50/60 to-sky-50/40' },
  locations: { gradient: 'from-sky-400 to-blue-500', bg: 'from-sky-50/80 via-blue-50/60 to-indigo-50/40' },
  users: { gradient: 'from-violet-400 to-purple-500', bg: 'from-violet-50/80 via-purple-50/60 to-fuchsia-50/40' },
};

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

  // Essential admin sections only
  const adminSections = [
    {
      title: 'Financials',
      description: 'Revenue overview and metrics',
      icon: DollarSign,
      href: '/dashboard/admin/financials',
      theme: cardThemes.financials,
      stat: `${stats.students} students`,
    },
    {
      title: 'Students',
      description: 'View enrolled students',
      icon: GraduationCap,
      href: '/dashboard/admin/students',
      theme: cardThemes.students,
      stat: `${stats.students} enrolled`,
    },
    {
      title: 'Waivers',
      description: 'Signed enrollment waivers',
      icon: FileCheck,
      href: '/dashboard/admin/waivers',
      theme: cardThemes.waivers,
      stat: `${stats.students} signed`,
    },
    {
      title: 'Locations',
      description: 'Manage locations',
      icon: MapPin,
      href: '/dashboard/admin/locations',
      theme: cardThemes.locations,
      stat: `${stats.locations} active`,
    },
    {
      title: 'Users',
      description: 'Parent accounts',
      icon: Users,
      href: '/dashboard/admin/users',
      theme: cardThemes.users,
      stat: `${stats.users} registered`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header - Glassmorphism Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-teal-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-violet-500/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Admin Panel
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your Little Grapplers platform
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - 3 Essential Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-500">Students</span>
            </div>
            <div className="text-3xl font-bold text-emerald-700">{stats.students}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-indigo-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-500">Locations</span>
            </div>
            <div className="text-3xl font-bold text-sky-700">{stats.locations}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-fuchsia-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-500">Users</span>
            </div>
            <div className="text-3xl font-bold text-violet-700">{stats.users}</div>
          </CardContent>
        </Card>

      </div>

      {/* Admin Sections - Apple Glass Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminSections.map((section) => (
          <Card 
            key={section.title} 
            className={`group relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${section.theme.bg} backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${section.theme.gradient} flex items-center justify-center shadow-sm`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-semibold text-slate-800">{section.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                <span className="text-xs font-medium text-slate-500">{section.stat}</span>
                <Button 
                  size="sm" 
                  className={`bg-gradient-to-r ${section.theme.gradient} text-white border-0 shadow-sm hover:shadow-md transition-all`}
                  asChild
                >
                  <Link href={section.href as Route}>
                    Manage
                    <ArrowRight className="h-4 w-4 ml-1.5" />
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
