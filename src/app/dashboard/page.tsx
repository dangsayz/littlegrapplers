import Link from 'next/link';
import { Plus, Users, ArrowRight, User } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';

interface StudentDisplay {
  id: string;
  firstName: string;
  lastName: string;
  beltRank: string;
  stripes: number;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName || 'there';

  // Fetch students
  const students: StudentDisplay[] = [];
  const seenNames = new Set<string>();

  if (userId) {
    // Get from students table first
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
          .select('id, first_name, last_name, belt_rank, stripes, is_active')
          .eq('parent_id', parent.id)
          .neq('is_active', false);

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
              });
            }
          }
        }
      }
    }

    // Fallback to waivers
    if (students.length === 0) {
      const { data: waivers } = await supabaseAdmin
        .from('signed_waivers')
        .select('id, child_full_name, is_active')
        .eq('clerk_user_id', userId)
        .neq('is_active', false);

      if (waivers) {
        for (const w of waivers) {
          const parts = (w.child_full_name || '').split(' ');
          const fName = parts[0] || '';
          const lName = parts.slice(1).join(' ') || '';
          const key = `${fName.toLowerCase()}-${lName.toLowerCase()}`;
          if (!seenNames.has(key)) {
            seenNames.add(key);
            students.push({
              id: w.id,
              firstName: fName,
              lastName: lName,
              beltRank: 'white',
              stripes: 0,
            });
          }
        }
      }
    }
  }

  const hasStudents = students.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Simple Welcome */}
      <div className="text-center pt-4">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Hi, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2">
          {hasStudents 
            ? `You have ${students.length} student${students.length > 1 ? 's' : ''} enrolled`
            : 'Get started by adding your first student'
          }
        </p>
      </div>

      {/* Students List - Simple Cards */}
      <div className="space-y-3">
        {hasStudents ? (
          <>
            {students.map((student) => (
              <Link key={student.id} href={`/dashboard/students/${student.id}`}>
                <Card className="hover:shadow-md hover:border-brand/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-brand" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {student.beltRank.replace('_', ' ')} Belt
                          {student.stripes > 0 && ` · ${student.stripes} stripe${student.stripes > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No students yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your child to get started with classes
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard/students/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Student
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Another Button */}
      {hasStudents && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Student
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
