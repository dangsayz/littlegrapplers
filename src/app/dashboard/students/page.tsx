import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentCard, NoStudentsCard } from '@/components/dashboard';

// TODO: Replace with actual database query
const mockStudents = [
  {
    id: '1',
    firstName: 'Timmy',
    lastName: 'Johnson',
    beltRank: 'yellow',
    stripes: 2,
    avatarUrl: null,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    beltRank: 'white',
    stripes: 4,
    avatarUrl: null,
  },
];

export default async function StudentsPage() {
  const students = mockStudents;
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
