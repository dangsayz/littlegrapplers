import { redirect } from 'next/navigation';
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
  CreditCard,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
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

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminFinancialsPage() {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
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

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Financials Dashboard
          </h1>
          <p className="text-muted-foreground">
            Revenue overview and membership metrics
          </p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {formatCurrency(estimatedMonthlyRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {totalWaivers} active students × ${MONTHLY_RATE}/mo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Annual Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(estimatedAnnualRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Projected yearly revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold mt-1">{totalWaivers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active enrolled children
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30-Day Growth</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-3xl font-bold ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveGrowth ? '+' : ''}{growthRate}%
                  </p>
                  {isPositiveGrowth ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isPositiveGrowth ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPositiveGrowth ? (
                  <TrendingUp className={`h-6 w-6 ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {recentWaivers.length} new vs {previousPeriodWaivers.length} previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            Revenue by Location
          </CardTitle>
          <CardDescription>
            Breakdown of students and estimated revenue per location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations && locations.length > 0 ? (
              locations.map((location: { id: string; name: string; slug: string }) => {
                const studentCount = waiversByLocation[location.id] || 0;
                const locationRevenue = studentCount * MONTHLY_RATE;
                const percentage = totalWaivers > 0 ? (studentCount / totalWaivers * 100).toFixed(0) : 0;
                
                return (
                  <div key={location.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {studentCount} students • {formatCurrency(locationRevenue)}/mo
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="secondary">{percentage}%</Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">No locations found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Recent Enrollments
          </CardTitle>
          <CardDescription>
            Latest signed waivers and contract start dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waiversError ? (
            <p className="text-destructive">Error loading waivers: {waiversError.message}</p>
          ) : !waivers || waivers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No enrollments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Parent Email</TableHead>
                    <TableHead>Contract Date</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waivers.slice(0, 20).map((waiver: {
                    id: string;
                    child_full_name: string;
                    parent_first_name: string;
                    parent_last_name: string;
                    parent_email: string;
                    signed_at: string;
                  }) => (
                    <TableRow key={waiver.id}>
                      <TableCell className="font-medium">
                        {waiver.child_full_name}
                      </TableCell>
                      <TableCell>
                        {waiver.parent_first_name} {waiver.parent_last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {waiver.parent_email}
                      </TableCell>
                      <TableCell>
                        {formatDate(waiver.signed_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${MONTHLY_RATE}/mo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {waivers.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Showing 20 of {waivers.length} enrollments
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Customer Accounts
          </CardTitle>
          <CardDescription>
            Registered parent/guardian accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No registered users yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
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
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.first_name || u.last_name 
                          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                          : <span className="text-muted-foreground">Not provided</span>
                        }
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.phone || '-'}
                      </TableCell>
                      <TableCell>{formatDate(u.created_at)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={u.status === 'active' ? 'default' : 'secondary'}
                          className={u.status === 'active' ? 'bg-green-500' : ''}
                        >
                          {u.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length > 15 && (
                <div className="text-center mt-4">
                  <Link 
                    href="/dashboard/admin/users" 
                    className="text-sm text-brand hover:underline"
                  >
                    View all {users.length} users →
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
