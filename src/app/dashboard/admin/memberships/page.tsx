import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Search, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const MONTHLY_RATE = 99;

export default async function AdminMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;

  // Fetch all signed waivers as memberships
  let query = supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .order('signed_at', { ascending: false });

  if (resolvedSearchParams.search) {
    query = query.or(`child_full_name.ilike.%${resolvedSearchParams.search}%,parent_email.ilike.%${resolvedSearchParams.search}%`);
  }

  const { data: memberships, error } = await query.limit(100);

  // Calculate totals
  const totalMemberships = memberships?.length || 0;
  const monthlyRevenue = totalMemberships * MONTHLY_RATE;
  const annualRevenue = monthlyRevenue * 12;

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
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Memberships
            </h1>
            <p className="text-slate-400 mt-1">
              View and manage all memberships and contracts
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-slate-500">Active Memberships</span>
            </div>
            <div className="text-3xl font-bold text-emerald-700 mt-1">{totalMemberships}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-slate-500">Monthly Revenue</span>
            </div>
            <div className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(monthlyRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-indigo-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span className="text-sm text-slate-500">Annual Revenue</span>
            </div>
            <div className="text-3xl font-bold text-sky-700 mt-1">{formatCurrency(annualRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search by child name or parent email..."
                defaultValue={resolvedSearchParams.search || ''}
                className="pl-9 border-slate-200"
              />
            </div>
            <select
              name="status"
              defaultValue={resolvedSearchParams.status || 'all'}
              className="h-10 rounded-md border border-slate-200 bg-white/80 px-3 text-sm text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button type="submit" className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 shadow-sm">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Memberships Table */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">All Memberships</CardTitle>
          <CardDescription>
            {memberships?.length || 0} membership{(memberships?.length || 0) !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">Error loading memberships: {error.message}</p>
          ) : !memberships || memberships.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No memberships found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contract Date</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.map((membership: {
                    id: string;
                    child_full_name: string;
                    parent_first_name: string;
                    parent_last_name: string;
                    parent_email: string;
                    signed_at: string;
                  }) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.child_full_name}
                      </TableCell>
                      <TableCell>
                        {membership.parent_first_name} {membership.parent_last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {membership.parent_email}
                      </TableCell>
                      <TableCell>
                        {formatDate(membership.signed_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${MONTHLY_RATE}/mo
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
