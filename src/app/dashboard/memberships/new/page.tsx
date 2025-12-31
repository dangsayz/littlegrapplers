import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MapPin, Clock, ArrowRight } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';

const INQUIRY_EMAIL = 'sshnaydbjj@gmail.com';

const programs = [
  {
    id: 'tiny',
    name: 'Tiny Grapplers',
    ageRange: 'Ages 3-5',
    description: 'Introduction to movement and martial arts fundamentals through games.',
    schedule: '30-45 min classes',
  },
  {
    id: 'junior',
    name: 'Junior Grapplers',
    ageRange: 'Ages 6-8',
    description: 'Real BJJ techniques with positions, escapes, and controlled sparring.',
    schedule: '45 min classes',
  },
  {
    id: 'advanced',
    name: 'Advanced Grapplers',
    ageRange: 'Ages 9-12',
    description: 'Complex techniques, competition prep, and leadership development.',
    schedule: '60 min classes',
  },
];

function buildMailtoLink(programName: string, ageRange: string, studentName?: string) {
  const subject = encodeURIComponent(`Inquiry about ${programName} Program`);
  const body = encodeURIComponent(
`Hi,

I would like to inquire about the ${programName} program (${ageRange}) for my child${studentName ? `, ${studentName}` : ''}.

Could you please provide more information about:
- Class schedules and availability
- Trial class options
- Enrollment process

Thank you!`
  );
  return `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
}

export default async function NewMembershipPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's students
  const students: Array<{ id: string; firstName: string; lastName: string }> = [];

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
        .select('id, first_name, last_name')
        .eq('parent_id', parent.id)
        .neq('is_active', false);

      if (studentRecords) {
        for (const s of studentRecords) {
          students.push({
            id: s.id,
            firstName: s.first_name || '',
            lastName: s.last_name || '',
          });
        }
      }
    }
  }

  // Fallback to waivers if no students
  if (students.length === 0) {
    const { data: waivers } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, is_active')
      .eq('clerk_user_id', userId)
      .neq('is_active', false);

    if (waivers) {
      for (const w of waivers) {
        const parts = (w.child_full_name || '').split(' ');
        students.push({
          id: w.id,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
        });
      }
    }
  }

  // Fetch locations
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, address');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold">Choose a Program</h1>
        <p className="text-muted-foreground mt-2">
          Select the right program for your child
        </p>
      </div>

      {/* No students warning */}
      {students.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="font-medium text-amber-800">Add a student first</p>
            <p className="text-sm text-amber-600 mb-4">You need to add a student before enrolling in a program</p>
            <Button size="sm" asChild>
              <Link href="/dashboard/students/new">Add Student</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Programs */}
      <div className="space-y-4">
        {programs.map((program) => (
          <Card key={program.id} className="hover:shadow-md hover:border-brand/30 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand mb-2">
                    {program.ageRange}
                  </div>
                  <h3 className="text-lg font-semibold">{program.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{program.schedule}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  asChild
                >
                  <a href={buildMailtoLink(program.name, program.ageRange, students[0]?.firstName)}>
                    Inquire
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Locations */}
      {locations && locations.length > 0 && (
        <div className="pt-4">
          <h2 className="text-lg font-semibold mb-4">Our Locations</h2>
          <div className="space-y-3">
            {locations.map((loc: { id: string; name: string; address: string }) => (
              <div key={loc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-brand" />
                <div>
                  <p className="font-medium text-sm">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">{loc.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
