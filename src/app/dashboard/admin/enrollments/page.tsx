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
import { SearchForm } from './search-form';
import { CreateEnrollmentDialog } from './create-enrollment-dialog';

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending: { 
    label: 'Pending Review', 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    icon: Clock,
  },
  approved: { 
    label: 'Awaiting Payment', 
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    icon: Clock,
  },
  active: { 
    label: 'Active', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: CheckCircle,
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: XCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-slate-50 text-slate-500 border-slate-100',
    icon: XCircle,
  },
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; status?: string; location?: string }>;
}

export default async function AdminEnrollmentsPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const statusFilter = resolvedSearchParams.status || 'all';
  const locationFilter = resolvedSearchParams.location || 'all';

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

  if (resolvedSearchParams.search) {
    countQuery = countQuery.or(
      `guardian_first_name.ilike.%${resolvedSearchParams.search}%,guardian_last_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_first_name.ilike.%${resolvedSearchParams.search}%,child_last_name.ilike.%${resolvedSearchParams.search}%`
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

  if (resolvedSearchParams.search) {
    query = query.or(
      `guardian_first_name.ilike.%${resolvedSearchParams.search}%,guardian_last_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_first_name.ilike.%${resolvedSearchParams.search}%,child_last_name.ilike.%${resolvedSearchParams.search}%`
    );
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (locationFilter !== 'all') {
    query = query.eq('location_id', locationFilter);
  }

  const { data: enrollments, error } = await query;

  // Fetch subscriptions to verify payment status for active enrollments
  const enrollmentIds = enrollments?.map(e => e.id) || [];
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('enrollment_id, status, stripe_subscription_id')
    .in('enrollment_id', enrollmentIds.length > 0 ? enrollmentIds : ['none']);
  
  // Create a map of enrollment_id to payment status
  const paymentMap = new Map<string, boolean>();
  subscriptions?.forEach(sub => {
    if (sub.enrollment_id && sub.status === 'active') {
      paymentMap.set(sub.enrollment_id, true);
    }
  });

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
  if (resolvedSearchParams.search) paginationParams.search = resolvedSearchParams.search;
  if (resolvedSearchParams.status) paginationParams.status = resolvedSearchParams.status;
  if (resolvedSearchParams.location) paginationParams.location = resolvedSearchParams.location;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Enrollments' },
        ]}
      />

      {/* Page Header - Apple Clean Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/50">
            <UserPlus className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Enrollments
            </h1>
            <p className="text-slate-500 text-sm">
              Review and approve new enrollment applications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(pendingCount || 0) > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-600 text-sm font-medium">{pendingCount} pending</span>
            </div>
          )}
          <CreateEnrollmentDialog locations={locations || []} />
        </div>
      </div>

      {/* How It Works - Quick Guide */}
      <Card className="border border-slate-200/60 bg-slate-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200/60 flex-shrink-0">
              <Lightbulb className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-700 mb-2 text-sm">How Enrollments Work</h3>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-medium">1</div>
                  <span className="text-slate-600">Parent submits waiver form</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-medium">2</div>
                  <span className="text-slate-600">You review and <strong>Approve</strong> or <strong>Reject</strong></span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-medium">3</div>
                  <span className="text-slate-600">Student record is auto-created</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row - Unified Container */}
      <div className="flex items-stretch bg-white rounded-2xl border border-slate-200/60 divide-x divide-slate-100">
        <Link href="/dashboard/admin/enrollments?status=pending" className={`flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors first:rounded-l-2xl ${statusFilter === 'pending' ? 'bg-slate-50' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-slate-500">Pending</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{pendingCount || 0}</div>
        </Link>
        <Link href="/dashboard/admin/enrollments?status=approved" className={`flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors ${statusFilter === 'approved' ? 'bg-slate-50' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-xs text-slate-500">Approved</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{approvedCount || 0}</div>
        </Link>
        <Link href="/dashboard/admin/enrollments?status=active" className={`flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors ${statusFilter === 'active' ? 'bg-slate-50' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-slate-500">Active</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{activeCount || 0}</div>
        </Link>
        <Link href="/dashboard/admin/enrollments" className={`flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors last:rounded-r-2xl ${statusFilter === 'all' ? 'bg-slate-50' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <UserPlus className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{totalEnrollments || 0}</div>
        </Link>
      </div>

      {/* Filters */}
      <SearchForm 
        locations={locations || []}
        defaultSearch={resolvedSearchParams.search}
        defaultStatus={statusFilter}
        defaultLocation={locationFilter}
      />

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
            const hasPaid = paymentMap.get(enrollment.id) || false;
            const isActiveWithoutPayment = enrollment.status === 'active' && !hasPaid;
            
            return (
              <Link 
                key={enrollment.id} 
                href={`/dashboard/admin/enrollments/${enrollment.id}`}
                className="block"
              >
                <div className={`p-4 rounded-xl border bg-white transition-all hover:bg-slate-50/50 ${enrollment.status === 'pending' ? 'border-slate-200' : 'border-slate-200/60'}`}>
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Primary info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Status indicator */}
                      <div className={`flex-shrink-0 w-1 h-10 rounded-full ${
                        enrollment.status === 'pending' ? 'bg-orange-300' :
                        enrollment.status === 'active' ? 'bg-emerald-400' :
                        enrollment.status === 'approved' ? 'bg-sky-400' :
                        'bg-slate-200'
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

                    {/* Right: Status badge & payment indicator */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isActiveWithoutPayment && (
                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 border text-xs font-medium">
                          No Payment
                        </Badge>
                      )}
                      {enrollment.status === 'active' && hasPaid && (
                        <Badge className="bg-green-50 text-green-600 border-green-200 border text-xs font-medium">
                          Paid
                        </Badge>
                      )}
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
