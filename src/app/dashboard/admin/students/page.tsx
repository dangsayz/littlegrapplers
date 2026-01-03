import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Search, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
  searchParams: { search?: string; location?: string };
}) {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  // Fetch all signed waivers (students)
  let query = supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .order('signed_at', { ascending: false });

  if (searchParams.search) {
    query = query.or(`child_full_name.ilike.%${searchParams.search}%,parent_email.ilike.%${searchParams.search}%,parent_first_name.ilike.%${searchParams.search}%,parent_last_name.ilike.%${searchParams.search}%`);
  }

  const { data: students, error } = await query.limit(100);

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
                defaultValue={searchParams.search || ''}
                className="pl-9 border-slate-200"
              />
            </div>
            <select
              name="location"
              defaultValue={searchParams.location || 'all'}
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
              <Table>
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
                  }) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.child_full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {calculateAge(student.child_date_of_birth)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.parent_first_name} {student.parent_last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.parent_email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.parent_phone || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
