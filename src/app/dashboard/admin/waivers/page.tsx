import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { FileCheck, Search, Eye, Download, Calendar, User, Baby } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseAdmin } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; consent?: string }>;
}

export default async function AdminWaiversPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count for pagination
  let countQuery = supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true });

  if (resolvedSearchParams.search) {
    countQuery = countQuery.or(
      `guardian_full_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_full_name.ilike.%${resolvedSearchParams.search}%`
    );
  }

  if (resolvedSearchParams.consent === 'granted') {
    countQuery = countQuery.eq('photo_media_consent', true);
  } else if (resolvedSearchParams.consent === 'not-granted') {
    countQuery = countQuery.eq('photo_media_consent', false);
  }

  const { count: totalCount } = await countQuery;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  // Fetch waivers with pagination
  let query = supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .order('signed_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (resolvedSearchParams.search) {
    query = query.or(
      `guardian_full_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_full_name.ilike.%${resolvedSearchParams.search}%`
    );
  }

  if (resolvedSearchParams.consent === 'granted') {
    query = query.eq('photo_media_consent', true);
  } else if (resolvedSearchParams.consent === 'not-granted') {
    query = query.eq('photo_media_consent', false);
  }

  const { data: waivers, error } = await query;

  // Get stats
  const { count: totalWaivers } = await supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true });

  const { count: consentGranted } = await supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true })
    .eq('photo_media_consent', true);

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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (resolvedSearchParams.search) paginationParams.search = resolvedSearchParams.search;
  if (resolvedSearchParams.consent) paginationParams.consent = resolvedSearchParams.consent;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Waivers' },
        ]}
      />

      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-sm">
            <FileCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Waivers
            </h1>
            <p className="text-slate-400 mt-1">
              View all parents who signed enrollment waivers
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-teal-50/80 via-cyan-50/60 to-sky-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-teal-600" />
              <span className="text-sm text-slate-500">Total Waivers</span>
            </div>
            <div className="text-3xl font-bold text-teal-700 mt-1">{totalWaivers || 0}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-slate-500">Media Consent</span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 mt-1">
              {consentGranted || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-slate-500">No Consent</span>
            </div>
            <div className="text-3xl font-bold text-amber-700 mt-1">
              {(totalWaivers || 0) - (consentGranted || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search by parent name, email, or child name..."
                defaultValue={resolvedSearchParams.search}
                className="pl-10 border-slate-200"
              />
            </div>
            <select
              name="consent"
              defaultValue={resolvedSearchParams.consent || 'all'}
              className="px-3 py-2 rounded-md border border-slate-200 bg-white/80 text-slate-600"
            >
              <option value="all">All Consent Status</option>
              <option value="granted">Media Consent Granted</option>
              <option value="not-granted">No Media Consent</option>
            </select>
            <Button type="submit" className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0 shadow-sm">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Waivers Table */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Parent/Guardian</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Media Consent</TableHead>
                <TableHead>Signed Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(waivers || []).map((waiver) => (
                <TableRow key={waiver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                        <User className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <p className="font-medium">{waiver.guardian_full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {waiver.guardian_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{waiver.child_full_name}</p>
                      {waiver.child_date_of_birth && (
                        <p className="text-sm text-muted-foreground">
                          DOB: {formatDate(waiver.child_date_of_birth)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {waiver.guardian_phone && (
                        <p className="text-muted-foreground">{waiver.guardian_phone}</p>
                      )}
                      {waiver.emergency_contact_name && (
                        <p className="text-xs text-muted-foreground">
                          Emergency: {waiver.emergency_contact_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {waiver.photo_media_consent ? (
                      <Badge variant="default" className="bg-green-500">
                        Granted
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Granted</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(waiver.signed_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/waivers/${waiver.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!waivers || waivers.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No waivers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of{' '}
            {totalCount || 0} waivers
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/dashboard/admin/waivers"
            searchParams={paginationParams}
          />
        </div>
      )}
    </div>
  );
}
