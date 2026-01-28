import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Search, Eye, Pencil, Trash2, MoreHorizontal, CreditCard } from 'lucide-react';
import { PaymentLinkButton } from '@/components/admin/payment-link-button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; location?: string; status?: string }>;
}) {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;

  // Fetch all enrollments (the source of truth for students)
  let query = supabaseAdmin
    .from('enrollments')
    .select(`
      id,
      child_first_name,
      child_last_name,
      child_date_of_birth,
      guardian_first_name,
      guardian_last_name,
      guardian_email,
      guardian_phone,
      status,
      location_id,
      submitted_at,
      locations(name)
    `)
    .order('submitted_at', { ascending: false });

  // Filter by status
  const statusFilter = resolvedSearchParams.status || 'active';
  if (statusFilter === 'active') {
    query = query.in('status', ['approved', 'active']);
  } else if (statusFilter === 'cancelled') {
    query = query.eq('status', 'cancelled');
  }
  // 'all' = no status filter

  if (resolvedSearchParams.search) {
    query = query.or(`child_first_name.ilike.%${resolvedSearchParams.search}%,child_last_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,guardian_first_name.ilike.%${resolvedSearchParams.search}%,guardian_last_name.ilike.%${resolvedSearchParams.search}%`);
  }

  if (resolvedSearchParams.location && resolvedSearchParams.location !== 'all') {
    query = query.eq('location_id', resolvedSearchParams.location);
  }

  const { data: enrollments, error } = await query.limit(100);

  // Transform to student format for display
  const students = (enrollments || []).map(e => ({
    id: e.id,
    child_full_name: `${e.child_first_name} ${e.child_last_name}`,
    child_date_of_birth: e.child_date_of_birth,
    parent_first_name: e.guardian_first_name,
    parent_last_name: e.guardian_last_name,
    parent_email: e.guardian_email,
    parent_phone: e.guardian_phone,
    signed_at: e.submitted_at,
    status: e.status,
    location_name: (e.locations as unknown as { name: string } | null)?.name || 'Unknown',
  }));

  // Fetch locations for filter
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name')
    .eq('is_active', true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} yrs`;
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-sm">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Students
            </h1>
            <p className="text-slate-400 mt-1">
              View all enrolled students across locations
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Search by child name, parent name, or email..."
                defaultValue={resolvedSearchParams.search || ''}
                className="pl-9 border-slate-200"
              />
            </div>
            <select
              name="status"
              defaultValue={resolvedSearchParams.status || 'active'}
              className="h-10 rounded-md border border-slate-200 bg-white/80 px-3 text-sm text-slate-600"
            >
              <option value="active">Active Only</option>
              <option value="all">All Students</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              name="location"
              defaultValue={resolvedSearchParams.location || 'all'}
              className="h-10 rounded-md border border-slate-200 bg-white/80 px-3 text-sm text-slate-600"
            >
              <option value="all">All Locations</option>
              {locations?.map((loc: { id: string; name: string }) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <Button type="submit" className="bg-gradient-to-r from-indigo-400 to-violet-500 text-white border-0 shadow-sm">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Enrolled Students</CardTitle>
          <CardDescription>
            {students?.length || 0} student{(students?.length || 0) !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">Error loading students: {error.message}</p>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Parent Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: {
                    id: string;
                    child_full_name: string;
                    child_date_of_birth: string | null;
                    parent_first_name: string;
                    parent_last_name: string;
                    parent_email: string;
                    parent_phone: string | null;
                    signed_at: string;
                    status: string;
                    location_name: string;
                  }) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.child_full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {calculateAge(student.child_date_of_birth)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.parent_first_name} {student.parent_last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.parent_email}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {student.parent_phone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(student.signed_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/students/${student.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/students/${student.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Student
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5">
                              <PaymentLinkButton
                                studentId={student.id}
                                studentName={student.child_full_name}
                                parentEmail={student.parent_email}
                              />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              asChild
                            >
                              <Link href={`/dashboard/admin/students/${student.id}/delete`}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
