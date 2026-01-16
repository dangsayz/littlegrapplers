import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  UserPlus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Calendar,
  Mail,
  Phone,
  Baby,
  Filter,
  HelpCircle,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Pagination } from '@/components/ui/pagination';
import { EnrollmentActions } from './enrollment-actions';
import { ClickStopWrapper } from './click-stop-wrapper';

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending: { 
    label: 'Awaiting Payment', 
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  approved: { 
    label: 'Awaiting Payment', 
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: XCircle,
  },
};

interface PageProps {
  searchParams: { search?: string; page?: string; status?: string; location?: string };
}

export default async function AdminEnrollmentsPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const currentPage = parseInt(searchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const statusFilter = searchParams.status || 'all';
  const locationFilter = searchParams.location || 'all';

  // Fetch locations for filter dropdown
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  // Build count query
  let countQuery = supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true });

  if (searchParams.search) {
    countQuery = countQuery.or(
      `guardian_first_name.ilike.%${searchParams.search}%,guardian_last_name.ilike.%${searchParams.search}%,guardian_email.ilike.%${searchParams.search}%,child_first_name.ilike.%${searchParams.search}%,child_last_name.ilike.%${searchParams.search}%`
    );
  }

  if (statusFilter !== 'all') {
    countQuery = countQuery.eq('status', statusFilter);
  }

  if (locationFilter !== 'all') {
    countQuery = countQuery.eq('location_id', locationFilter);
  }

  const { count: totalCount } = await countQuery;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  // Fetch enrollments with pagination
  let query = supabaseAdmin
    .from('enrollments')
    .select(`
      *,
      locations(id, name, slug)
    `)
    .order('submitted_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (searchParams.search) {
    query = query.or(
      `guardian_first_name.ilike.%${searchParams.search}%,guardian_last_name.ilike.%${searchParams.search}%,guardian_email.ilike.%${searchParams.search}%,child_first_name.ilike.%${searchParams.search}%,child_last_name.ilike.%${searchParams.search}%`
    );
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (locationFilter !== 'all') {
    query = query.eq('location_id', locationFilter);
  }

  const { data: enrollments, error } = await query;

  // Get stats
  const { count: pendingCount } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: approvedCount } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: activeCount } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalEnrollments } = await supabaseAdmin
    .from('enrollments')
    .select('*', { count: 'exact', head: true });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (searchParams.search) paginationParams.search = searchParams.search;
  if (searchParams.status) paginationParams.status = searchParams.status;
  if (searchParams.location) paginationParams.location = searchParams.location;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Enrollments' },
        ]}
      />

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/10 via-transparent to-[#F7931E]/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#2EC4B6]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#F7931E]/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] shadow-sm">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                Enrollments
              </h1>
              <p className="text-slate-400 mt-1">
                Review and approve new enrollment applications
              </p>
            </div>
          </div>
          {(pendingCount || 0) > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 font-medium">{pendingCount} pending</span>
            </div>
          )}
        </div>
      </div>

      {/* How It Works - Quick Guide */}
      <Card className="border border-[#2EC4B6]/20 bg-gradient-to-r from-[#2EC4B6]/5 to-transparent">
        <CardContent className="py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2EC4B6]/10 flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-[#2EC4B6]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-2">How Enrollments Work</h3>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">1</div>
                  <span className="text-slate-600">Parent submits waiver form</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</div>
                  <span className="text-slate-600">You review and <strong>Approve</strong> or <strong>Reject</strong></span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">3</div>
                  <span className="text-slate-600">Student record is auto-created</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards with Hints */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 backdrop-blur-sm group cursor-help">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-slate-500">Pending</span>
              <HelpCircle className="h-3 w-3 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-amber-700 mt-1">{pendingCount || 0}</div>
            <p className="text-xs text-amber-600/70 mt-1">Needs your review</p>
          </CardContent>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            New applications waiting for approval
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
          </div>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-violet-50/40 backdrop-blur-sm group cursor-help">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-500">Approved</span>
              <HelpCircle className="h-3 w-3 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mt-1">{approvedCount || 0}</div>
            <p className="text-xs text-blue-600/70 mt-1">Ready for payment</p>
          </CardContent>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Approved but not yet paying
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
          </div>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 backdrop-blur-sm group cursor-help">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-slate-500">Active</span>
              <HelpCircle className="h-3 w-3 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-green-700 mt-1">{activeCount || 0}</div>
            <p className="text-xs text-green-600/70 mt-1">Currently enrolled</p>
          </CardContent>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Students actively enrolled in classes
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
          </div>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 backdrop-blur-sm group cursor-help">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-500">Total</span>
              <HelpCircle className="h-3 w-3 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-slate-700 mt-1">{totalEnrollments || 0}</div>
            <p className="text-xs text-slate-500/70 mt-1">All time</p>
          </CardContent>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
            Total enrollment applications received
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="search"
            placeholder="Search by name or email..."
            defaultValue={searchParams.search}
            className="pl-10 h-10 border-slate-200 bg-white rounded-lg"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 min-w-[130px]"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          name="location"
          defaultValue={locationFilter}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 min-w-[160px]"
        >
          <option value="all">All Locations</option>
          {(locations || []).map((loc) => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
        <Button type="submit" size="sm" className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
          Filter
        </Button>
      </form>

      {/* Enrollments List */}
      <div className="space-y-4">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center text-red-600">
              Error loading enrollments: {error.message}
            </CardContent>
          </Card>
        ) : !enrollments || enrollments.length === 0 ? (
          <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-600 mb-2">No enrollments found</h3>
              <p className="text-sm text-slate-500 mb-4">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} enrollments match your criteria`
                  : 'New enrollment applications will appear here when parents submit the waiver form'
                }
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                <Lightbulb className="h-3 w-3" />
                Parents sign up at: <span className="font-mono text-[#2EC4B6]">/waiver</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          enrollments.map((enrollment: any) => {
            const status = STATUS_CONFIG[enrollment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            
            return (
              <Link 
                key={enrollment.id} 
                href={`/dashboard/admin/enrollments/${enrollment.id}`}
                className="block"
              >
                <div className={`p-4 rounded-xl border bg-white transition-all hover:shadow-md hover:border-slate-300 ${enrollment.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Primary info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Status indicator */}
                      <div className={`flex-shrink-0 w-2 h-10 rounded-full ${
                        enrollment.status === 'pending' ? 'bg-amber-400' :
                        enrollment.status === 'active' ? 'bg-green-500' :
                        enrollment.status === 'approved' ? 'bg-blue-500' :
                        'bg-slate-300'
                      }`} />
                      
                      {/* Child name - Primary */}
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {enrollment.child_first_name} {enrollment.child_last_name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {enrollment.guardian_first_name} {enrollment.guardian_last_name}
                        </p>
                      </div>
                    </div>

                    {/* Center: Location & Date */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
                      {enrollment.locations && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {enrollment.locations.name}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {formatDateTime(enrollment.submitted_at)}
                      </span>
                    </div>

                    {/* Right: Status badge & action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={`${status.color} border text-xs font-medium`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of{' '}
            {totalCount || 0} enrollments
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/dashboard/admin/enrollments"
            searchParams={paginationParams}
          />
        </div>
      )}
    </div>
  );
}
