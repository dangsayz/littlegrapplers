import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  MapPin,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


// Pastel Design System - Admin Theme
const adminTheme = {
  // Primary stat cards - soft gradients
  revenue: {
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    border: 'border-emerald-200/60',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    text: 'text-emerald-700',
    accent: 'text-emerald-600',
  },
  annual: {
    gradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
    border: 'border-violet-200/60',
    iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
    text: 'text-violet-700',
    accent: 'text-violet-600',
  },
  students: {
    gradient: 'from-sky-50 via-blue-50 to-indigo-50',
    border: 'border-sky-200/60',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    text: 'text-sky-700',
    accent: 'text-sky-600',
  },
  growth: {
    positive: {
      gradient: 'from-lime-50 via-emerald-50 to-green-50',
      border: 'border-lime-200/60',
      iconBg: 'bg-gradient-to-br from-lime-400 to-emerald-500',
      text: 'text-emerald-700',
    },
    negative: {
      gradient: 'from-rose-50 via-pink-50 to-red-50',
      border: 'border-rose-200/60',
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
      text: 'text-rose-700',
    },
  },
};

export default async function AdminFinancialsPage() {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  // Fetch all signed waivers (these represent registered children/memberships)
  const { data: waivers, error: waiversError } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .order('signed_at', { ascending: false });

  // Fetch all locations
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug')
    .eq('is_active', true);

  // Fetch all users
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate metrics
  const totalWaivers = waivers?.length || 0;
  const totalUsers = users?.length || 0;
  
  // Monthly rate assumption (you can adjust this based on actual pricing)
  const MONTHLY_RATE = 99; // $99/month per student
  const estimatedMonthlyRevenue = totalWaivers * MONTHLY_RATE;
  const estimatedAnnualRevenue = estimatedMonthlyRevenue * 12;

  // Group waivers by location
  const waiversByLocation = (waivers || []).reduce((acc: Record<string, number>, waiver: { location_id?: string }) => {
    const locationId = waiver.location_id || 'unknown';
    acc[locationId] = (acc[locationId] || 0) + 1;
    return acc;
  }, {});

  // Get recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentWaivers = (waivers || []).filter((w: { signed_at: string }) => 
    new Date(w.signed_at) >= thirtyDaysAgo
  );

  // Get signups from previous 30 days for comparison
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const previousPeriodWaivers = (waivers || []).filter((w: { signed_at: string }) => {
    const date = new Date(w.signed_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  const growthRate = previousPeriodWaivers.length > 0 
    ? ((recentWaivers.length - previousPeriodWaivers.length) / previousPeriodWaivers.length * 100).toFixed(1)
    : recentWaivers.length > 0 ? '100' : '0';

  const isPositiveGrowth = parseFloat(growthRate) >= 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const growthTheme = isPositiveGrowth ? adminTheme.growth.positive : adminTheme.growth.negative;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Admin
      </Link>

      {/* Page Header - Glassmorphism Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
            <DollarSign className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Financials Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Revenue overview and membership metrics
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Cards - Pastel Gradient System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly Revenue */}
        <Card className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${adminTheme.revenue.gradient} backdrop-blur-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                <p className={`text-3xl font-bold tracking-tight ${adminTheme.revenue.text}`}>
                  {formatCurrency(estimatedMonthlyRevenue)}
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  {totalWaivers} students × ${MONTHLY_RATE}/mo
                </p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${adminTheme.revenue.iconBg} flex items-center justify-center shadow-sm`}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Annual Revenue */}
        <Card className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${adminTheme.annual.gradient} backdrop-blur-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Annual Revenue</p>
                <p className={`text-3xl font-bold tracking-tight ${adminTheme.annual.text}`}>
                  {formatCurrency(estimatedAnnualRevenue)}
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Projected yearly total
                </p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${adminTheme.annual.iconBg} flex items-center justify-center shadow-sm`}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${adminTheme.students.gradient} backdrop-blur-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className={`text-3xl font-bold tracking-tight ${adminTheme.students.text}`}>
                  {totalWaivers}
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Active enrolled children
                </p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${adminTheme.students.iconBg} flex items-center justify-center shadow-sm`}>
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${growthTheme.gradient} backdrop-blur-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 pb-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">30-Day Growth</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold tracking-tight ${growthTheme.text}`}>
                    {isPositiveGrowth ? '+' : ''}{growthRate}%
                  </p>
                  {isPositiveGrowth ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  {recentWaivers.length} new this period
                </p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${growthTheme.iconBg} flex items-center justify-center shadow-sm`}>
                {isPositiveGrowth ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Location */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue by Location</CardTitle>
              <CardDescription>
                Breakdown of students and estimated revenue per location
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-5">
            {locations && locations.length > 0 ? (
              locations.map((location: { id: string; name: string; slug: string }, index: number) => {
                const studentCount = waiversByLocation[location.id] || 0;
                const locationRevenue = studentCount * MONTHLY_RATE;
                const percentage = totalWaivers > 0 ? (studentCount / totalWaivers * 100).toFixed(0) : 0;
                const colors = [
                  'from-teal-400 to-emerald-500',
                  'from-violet-400 to-purple-500',
                  'from-sky-400 to-blue-500',
                  'from-amber-400 to-orange-500',
                  'from-rose-400 to-pink-500',
                ];
                const barColor = colors[index % colors.length];
                
                return (
                  <div key={location.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">{location.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                          {studentCount} students
                        </span>
                        <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-0 shadow-sm">
                          {formatCurrency(locationRevenue)}/mo
                        </Badge>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${Math.max(Number(percentage), 2)}%` }}
                      />
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs font-medium text-slate-400">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No locations found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Recent Enrollments</CardTitle>
              <CardDescription>
                Latest signed waivers and contract start dates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {waiversError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-rose-700">Error loading waivers: {waiversError.message}</p>
            </div>
          ) : !waivers || waivers.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white rounded-xl">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No enrollments yet</p>
              <p className="text-sm text-slate-400 mt-1">Enrollments will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-600">Child Name</TableHead>
                    <TableHead className="font-semibold text-slate-600">Parent Name</TableHead>
                    <TableHead className="font-semibold text-slate-600">Parent Email</TableHead>
                    <TableHead className="font-semibold text-slate-600">Contract Date</TableHead>
                    <TableHead className="font-semibold text-slate-600">Monthly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waivers.slice(0, 20).map((waiver: {
                    id: string;
                    child_full_name: string;
                    guardian_full_name: string;
                    guardian_email: string;
                    signed_at: string;
                  }) => (
                    <TableRow key={waiver.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-700">
                        {waiver.child_full_name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {waiver.guardian_full_name}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {waiver.guardian_email}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(waiver.signed_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 font-semibold">
                          ${MONTHLY_RATE}/mo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {waivers.length > 20 && (
                <div className="text-center py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing 20 of {waivers.length} enrollments
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered Users */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Customer Accounts</CardTitle>
              <CardDescription>
                Registered parent/guardian accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!users || users.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-white rounded-xl">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No registered users yet</p>
              <p className="text-sm text-slate-400 mt-1">User accounts will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-600">Name</TableHead>
                    <TableHead className="font-semibold text-slate-600">Email</TableHead>
                    <TableHead className="font-semibold text-slate-600">Phone</TableHead>
                    <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.slice(0, 15).map((u: {
                    id: string;
                    first_name: string | null;
                    last_name: string | null;
                    email: string;
                    phone: string | null;
                    created_at: string;
                    status: string;
                  }) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-700">
                        {u.first_name || u.last_name 
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : <span className="text-slate-400 font-normal">Not provided</span>
                        }
                      </TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-slate-500">
                        {u.phone || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(u.created_at)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={u.status === 'active' 
                            ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 font-semibold' 
                            : 'bg-slate-100 text-slate-600 border-0'
                          }
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length > 15 && (
                <div className="text-center py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
                  <Link 
                    href="/dashboard/admin/users" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    View all {users.length} users
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
