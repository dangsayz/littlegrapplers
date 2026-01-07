import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Mail, Users, TrendingUp, UserMinus, Download, Search } from 'lucide-react';
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


export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  // Build query
  let query = supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%`);
  }

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: subscribers, error } = await query.limit(100);

  // Get subscriber counts
  const { count: totalSubscribers } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true });

  const { count: activeSubscribers } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: unsubscribed } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unsubscribed');

  // Get subscribers from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: recentSubscribers } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .gte('subscribed_at', thirtyDaysAgo.toISOString())
    .eq('status', 'active');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'unsubscribed':
        return <Badge variant="secondary">Unsubscribed</Badge>;
      case 'bounced':
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string | null) => {
    if (!source) return null;
    const colors: Record<string, string> = {
      footer: 'bg-blue-100 text-blue-800',
      homepage: 'bg-purple-100 text-purple-800',
      popup: 'bg-orange-100 text-orange-800',
      checkout: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[source] || 'bg-gray-100 text-gray-800'}`}>
        {source}
      </span>
    );
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
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                Newsletter
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your email newsletter list
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500">Total</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-slate-700">{totalSubscribers || 0}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-slate-500">Active</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-700">{activeSubscribers || 0}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-pink-50/80 via-rose-50/60 to-fuchsia-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-pink-600" />
              <span className="text-sm text-slate-500">Last 30 Days</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-pink-700">{recentSubscribers || 0}</div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-2">
              <UserMinus className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-500">Unsubscribed</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-slate-700">{unsubscribed || 0}</div>
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
                placeholder="Search by email or name..."
                defaultValue={searchParams.search || ''}
                className="pl-9 border-slate-200"
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="h-10 rounded-md border border-slate-200 bg-white/80 px-3 text-sm text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
            <Button type="submit" className="bg-gradient-to-r from-pink-400 to-rose-500 text-white border-0 shadow-sm">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Subscribers</CardTitle>
          <CardDescription>
            {subscribers?.length || 0} subscriber{(subscribers?.length || 0) !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">Error loading subscribers: {error.message}</p>
          ) : !subscribers || subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No subscribers yet</p>
              <p className="text-sm text-muted-foreground/70">
                Subscribers will appear here when people sign up via your website.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber: {
                    id: string;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    source: string | null;
                    status: string;
                    subscribed_at: string;
                  }) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {subscriber.first_name || subscriber.last_name
                          ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>{getSourceBadge(subscriber.source)}</TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(subscriber.subscribed_at)}
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
