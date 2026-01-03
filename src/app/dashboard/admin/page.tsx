import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import type { Route } from 'next';
import { 
  MapPin, 
  Users, 
  FileCheck,
  ChevronRight,
  GraduationCap,
  Code2,
  Inbox,
} from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

// Apple-inspired accent colors
const accentColors = {
  blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  pink: { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600' },
  indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
};

export default async function AdminPage() {
  const user = await currentUser();
  
  // Check if user is the admin
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
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

  // Dev Work Log - separate billing section
  const devSection = {
    title: 'Dev Work Log',
    description: 'Development & billing',
    icon: Code2,
    href: '/dashboard/admin/developer',
    color: accentColors.indigo,
    stat: null,
    statLabel: 'View history',
  };

  // Essential admin sections
  const adminSections = [
    {
      title: 'Contact Inbox',
      description: 'Website inquiries from contact form',
      icon: Inbox,
      href: '/dashboard/admin/contacts',
      color: accentColors.orange,
      stat: stats.unreadContacts,
      statLabel: stats.unreadContacts === 1 ? 'unread' : 'unread',
      highlight: stats.unreadContacts > 0,
    },
    {
      title: 'Students',
      description: 'View enrolled students',
      icon: GraduationCap,
      href: '/dashboard/admin/students',
      color: accentColors.blue,
      stat: stats.students,
      statLabel: 'enrolled',
    },
    {
      title: 'Waivers',
      description: 'Signed enrollment waivers',
      icon: FileCheck,
      href: '/dashboard/admin/waivers',
      color: accentColors.purple,
      stat: stats.students,
      statLabel: 'signed',
    },
    {
      title: 'Locations',
      description: 'Manage locations',
      icon: MapPin,
      href: '/dashboard/admin/locations',
      color: accentColors.orange,
      stat: stats.locations,
      statLabel: 'active',
    },
    {
      title: 'Users',
      description: 'Parent accounts',
      icon: Users,
      href: '/dashboard/admin/users',
      color: accentColors.pink,
      stat: stats.users,
      statLabel: 'registered',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header - Clean Apple Style */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Admin
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your Little Grapplers platform
        </p>
      </div>

      {/* Dev Work Log - Urgent glass card with pulse */}
      <div className="relative mb-6 group">
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-slate-300 via-amber-200 to-slate-300 opacity-60 blur-[1px] group-hover:opacity-80 transition-opacity animate-pulse" />
        
        {/* Glass card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
          
          <Link
            href={devSection.href as Route}
            className="relative flex items-center gap-4 p-5 hover:bg-white/40 transition-all duration-300"
          >
            {/* Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/20 rounded-xl blur-lg animate-pulse" />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                <devSection.icon className="h-5 w-5 text-amber-300" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{devSection.title}</h3>
                {/* Urgent indicator */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200/50">
                  Review
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate">{devSection.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">{devSection.statLabel}</span>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Stats - Apple Card Style */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-full ${accentColors.blue.light} flex items-center justify-center`}>
              <GraduationCap className={`h-5 w-5 ${accentColors.blue.text}`} />
            </div>
            <span className="text-sm font-medium text-gray-500">Students</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-gray-900">{stats.students}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-full ${accentColors.orange.light} flex items-center justify-center`}>
              <MapPin className={`h-5 w-5 ${accentColors.orange.text}`} />
            </div>
            <span className="text-sm font-medium text-gray-500">Locations</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-gray-900">{stats.locations}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-full ${accentColors.pink.light} flex items-center justify-center`}>
              <Users className={`h-5 w-5 ${accentColors.pink.text}`} />
            </div>
            <span className="text-sm font-medium text-gray-500">Users</span>
          </div>
          <div className="text-4xl font-semibold tracking-tight text-gray-900">{stats.users}</div>
        </div>
      </div>

      {/* Admin Sections - Apple List Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {adminSections.map((section, index) => (
          <Link
            key={section.title}
            href={section.href as Route}
            className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
              index !== adminSections.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className={`h-11 w-11 rounded-xl ${section.color.bg} flex items-center justify-center flex-shrink-0`}>
              <section.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500 truncate">{section.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {section.stat !== null ? (
                <span className="text-sm text-gray-400">
                  {section.stat} {section.statLabel}
                </span>
              ) : (
                <span className="text-sm text-gray-400">{section.statLabel}</span>
              )}
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
