import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { StudentCard, NoStudentsCard } from '@/components/dashboard';
import { supabaseAdmin } from '@/lib/supabase';

export default async function StudentsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    return <div>Please sign in to view your students.</div>;
  }

  // Fetch waivers/students from Supabase by clerk_user_id
  const { data: waivers, error } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('signed_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
  }

  // Transform waiver data to student format
  const students = (waivers ?? []).map((waiver: {
    id: string;
    child_full_name: string;
    child_date_of_birth: string | null;
    signed_at: string;
  }) => {
    const nameParts = waiver.child_full_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      id: waiver.id,
      firstName,
      lastName,
      beltRank: 'white', // Default for new students
      stripes: 0,
      avatarUrl: null,
      dateOfBirth: waiver.child_date_of_birth,
      createdAt: waiver.signed_at,
    };
  });

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
