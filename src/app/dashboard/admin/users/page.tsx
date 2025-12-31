import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Users, Search, MoreHorizontal, Mail, Ban, Trash2, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './user-actions';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Build query
  let query = supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%`);
  }

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  const { data: users, error } = await query.limit(100);

  // Get user counts by status
  const { count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: activeUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: suspendedUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'suspended');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
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
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive" className="bg-red-700">Banned</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Users
            </h1>
            <p className="text-slate-400 mt-1">
              View and manage all registered users
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-slate-700">{totalUsers || 0}</div>
            <p className="text-sm text-slate-500">Total Users</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-green-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-emerald-700">{activeUsers || 0}</div>
            <p className="text-sm text-slate-500">Active</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-red-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-rose-700">{suspendedUsers || 0}</div>
            <p className="text-sm text-slate-500">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={searchParams.search}
                className="pl-10 border-slate-200"
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="px-3 py-2 rounded-md border border-slate-200 bg-white/80 text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="pending">Pending</option>
            </select>
            <Button type="submit" className="bg-gradient-to-r from-violet-400 to-purple-500 text-white border-0 shadow-sm">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-600">User</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                <TableHead className="font-semibold text-slate-600">Last Login</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-700">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(u.status)}</TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(u.created_at)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(u.last_login_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions user={u} />
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
