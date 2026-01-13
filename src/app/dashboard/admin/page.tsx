import { redirect } from 'next/navigation';
import { ADMIN_EMAILS, EXCLUDED_FROM_METRICS_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import type { Route } from 'next';

// Prevent Next.js from caching this page - always fetch fresh platform status
export const dynamic = 'force-dynamic';
import { 
  MapPin, 
  Users, 
  FileCheck,
  ChevronRight,
  GraduationCap,
  Receipt,
  Inbox,
  AlertCircle,
  UserPlus,
  Code2,
  HelpCircle,
  FileText,
  CreditCard,
  Power,
  Settings,
} from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { RevenueIntelligence, SiteControlToggle } from '@/components/dashboard';
import { isSuperAdmin } from '@/lib/admin-roles';

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

  const userEmail = user.emailAddresses[0].emailAddress;
  const userIsSuperAdmin = isSuperAdmin(userEmail);

  // Fetch dynamic stats (excluding admin/test accounts from user and waiver counts)
  const [locationsRes, threadsRes, contactsRes, newsletterRes, pendingEnrollmentsRes, unpaidWorkOrdersRes] = await Promise.all([
    supabaseAdmin.from('locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('discussion_threads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('work_orders').select('id, quoted_cost').eq('status', 'completed').eq('paid', false),
  ]);

  // Fetch users excluding admin/test emails
  const { data: allUsers } = await supabaseAdmin.from('users').select('email');
  const realUsers = (allUsers || []).filter(u => !EXCLUDED_FROM_METRICS_EMAILS.includes(u.email?.toLowerCase() || ''));
  const usersCount = realUsers.length;

  // Fetch waivers excluding admin/test emails
  const { data: allWaivers } = await supabaseAdmin.from('signed_waivers').select('guardian_email');
  const realWaivers = (allWaivers || []).filter(w => !EXCLUDED_FROM_METRICS_EMAILS.includes(w.guardian_email?.toLowerCase() || ''));
  const waiversCount = realWaivers.length;

  // Fetch platform status separately to handle schema cache issues gracefully
  let platformEnabled = true;
  try {
    const { data } = await supabaseAdmin.from('platform_status').select('is_enabled').limit(1).single();
    if (data) platformEnabled = data.is_enabled;
  } catch {
    // Table may not exist or be in schema cache yet - default to enabled
    console.log('Platform status table not available, defaulting to enabled');
  }

  // Calculate unpaid work orders total
  const unpaidWorkOrders = unpaidWorkOrdersRes.data || [];
  const unpaidTotal = unpaidWorkOrders.reduce((sum, wo) => sum + (wo.quoted_cost || 0), 0);
  const unpaidCount = unpaidWorkOrders.length;

  const stats = {
    locations: locationsRes.count || 0,
    threads: threadsRes.count || 0,
    users: usersCount,
    unreadContacts: contactsRes.count || 0,
    students: waiversCount,
    subscribers: newsletterRes.count || 0,
    pendingEnrollments: pendingEnrollmentsRes.count || 0,
  };


  // Essential admin sections
  const adminSections = [
    {
      title: 'Enrollments',
      description: 'Review and approve new applications',
      icon: UserPlus,
      href: '/dashboard/admin/enrollments',
      color: accentColors.green,
      stat: stats.pendingEnrollments,
      statLabel: 'pending',
      highlight: stats.pendingEnrollments > 0,
    },
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
      description: 'Signed enrollment waivers (legacy)',
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
    {
      title: 'Settings',
      description: 'Email, moderation & site configuration',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: accentColors.indigo,
      stat: null,
      statLabel: '',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto overflow-x-hidden">
      {/* Page Header - Clean Apple Style */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Admin
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your Little Grapplers platform
        </p>
      </div>

      {/* Site Control Toggle - Super Admin Only */}
      {userIsSuperAdmin && (
        <div className="mb-6">
          <SiteControlToggle 
            initialEnabled={platformEnabled} 
            adminEmail={userEmail} 
          />
        </div>
      )}

      {/* Revenue Intelligence Section - Pinned to Top */}
      <RevenueIntelligence 
        isConnected={false}
        metrics={{
          mrr: null,
          arr: null,
          projectedRevenue: null,
          activeSubscriptions: null,
          mrrGrowth: null,
          churnRate: null,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          DEVELOPMENT TEAM SECTION - Divider
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative my-10">
        {/* Divider Line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        
        {/* Section Label */}
        <div className="relative flex justify-center">
          <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700">Development Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Development Section Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Code2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Developer Portal</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage work orders, view invoices, and pay your development team
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
            <HelpCircle className="h-3 w-3" />
            <span>Private to you</span>
          </div>
        </div>
        
        {/* Quick Hints */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Submit work requests</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <Receipt className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">View completed tasks</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Pay invoices securely</span>
          </div>
        </div>
      </div>

      {/* INVOICE - Payment Due Card (only show if there's unpaid work) */}
      {unpaidTotal > 0 && (
      <Link
        href={'/dashboard/admin/developer' as Route}
        className="block mb-8 group"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-500 to-lime-500 p-6 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Invoice</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white text-green-600 animate-pulse">
                      <AlertCircle className="h-3 w-3" />
                      Payment Due
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mt-0.5">Development services</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
            
            {/* Amount */}
            <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/60 text-sm mb-1">Amount Due</p>
                <p className="text-4xl font-bold text-white tracking-tight">${unpaidTotal.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-2">{unpaidCount} completed {unpaidCount === 1 ? 'task' : 'tasks'}</p>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-green-600 font-semibold text-sm group-hover:bg-white/90 transition-colors">
                  View & Pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      )}

      {/* Quick Stats - Apple Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
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
