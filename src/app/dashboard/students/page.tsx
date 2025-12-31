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

  const hasStudents = students.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-brand" />
            My Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your children&apos;s profiles and progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
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
