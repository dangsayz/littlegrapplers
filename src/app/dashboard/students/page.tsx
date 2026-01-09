import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { StudentCard, NoStudentsCard } from '@/components/dashboard';
import { supabaseAdmin } from '@/lib/supabase';

interface StudentDisplay {
  id: string;
  firstName: string;
  lastName: string;
  beltRank: string;
  stripes: number;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  source: 'waiver' | 'student';
}

export default async function StudentsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    return <div>Please sign in to view your students.</div>;
  }

  const students: StudentDisplay[] = [];
  const seenNames = new Set<string>();

  // First, try to get students from the proper students table (via parent)
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (dbUser) {
    const { data: parent } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('user_id', dbUser.id)
      .single();

    if (parent) {
      const { data: studentRecords } = await supabaseAdmin
        .from('students')
        .select('id, first_name, last_name, date_of_birth, belt_rank, stripes, avatar_url, is_active')
        .eq('parent_id', parent.id)
        .neq('is_active', false)
        .order('created_at', { ascending: false });

      if (studentRecords) {
        for (const s of studentRecords) {
          const key = `${s.first_name?.toLowerCase()}-${s.last_name?.toLowerCase()}`;
          if (!seenNames.has(key)) {
            seenNames.add(key);
            students.push({
              id: s.id,
              firstName: s.first_name || '',
              lastName: s.last_name || '',
              beltRank: s.belt_rank || 'white',
              stripes: s.stripes || 0,
              avatarUrl: s.avatar_url || null,
              dateOfBirth: s.date_of_birth,
              source: 'student',
            });
          }
        }
      }
    }
  }

  // Then, check for waiver-only students (not yet in students table)
  const { data: waivers } = await supabaseAdmin
    .from('signed_waivers')
    .select('id, child_full_name, child_date_of_birth, signed_at, is_active')
    .eq('clerk_user_id', userId)
    .neq('is_active', false)
    .order('signed_at', { ascending: false });

  // Add waiver students that aren't already in students list
  if (waivers) {
    for (const waiver of waivers) {
      const nameParts = (waiver.child_full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const key = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

      if (!seenNames.has(key)) {
        seenNames.add(key);
        students.push({
          id: waiver.id,
          firstName,
          lastName,
          beltRank: 'white',
          stripes: 0,
          avatarUrl: null,
          dateOfBirth: waiver.child_date_of_birth,
          source: 'waiver',
        });
      }
    }
  }

  // Also check enrollments table (new enrollment system)
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('id, child_first_name, child_last_name, child_date_of_birth, status')
    .eq('clerk_user_id', userId)
    .in('status', ['active', 'approved', 'pending']);

  if (enrollments) {
    for (const e of enrollments) {
      const key = `${(e.child_first_name || '').toLowerCase()}-${(e.child_last_name || '').toLowerCase()}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        students.push({
          id: e.id,
          firstName: e.child_first_name || '',
          lastName: e.child_last_name || '',
          beltRank: 'white',
          stripes: 0,
          avatarUrl: null,
          dateOfBirth: e.child_date_of_birth,
          source: 'waiver',
        });
      }
    }
  }

  const hasStudents = students.length > 0;

  return (
    <div className="space-y-8">
      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-sm">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                My Students
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your children&apos;s profiles and progress
              </p>
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-indigo-400 to-violet-500 text-white border-0 shadow-sm">
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      {hasStudents ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <NoStudentsCard />
      )}
    </div>
  );
}
