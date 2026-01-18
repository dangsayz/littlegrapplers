import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Award, Calendar, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import { RemoveStudentButton } from './remove-student-button';

// Belt rank display mapping
const beltConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  white: { label: 'White Belt', bgColor: 'bg-white border', textColor: 'text-gray-900' },
  grey_white: { label: 'Grey/White Belt', bgColor: 'bg-gray-400', textColor: 'text-white' },
  grey: { label: 'Grey Belt', bgColor: 'bg-gray-500', textColor: 'text-white' },
  grey_black: { label: 'Grey/Black Belt', bgColor: 'bg-gray-600', textColor: 'text-white' },
  yellow_white: { label: 'Yellow/White Belt', bgColor: 'bg-yellow-400', textColor: 'text-gray-900' },
  yellow: { label: 'Yellow Belt', bgColor: 'bg-yellow-500', textColor: 'text-gray-900' },
  yellow_black: { label: 'Yellow/Black Belt', bgColor: 'bg-yellow-600', textColor: 'text-white' },
  orange_white: { label: 'Orange/White Belt', bgColor: 'bg-orange-400', textColor: 'text-white' },
  orange: { label: 'Orange Belt', bgColor: 'bg-orange-500', textColor: 'text-white' },
  orange_black: { label: 'Orange/Black Belt', bgColor: 'bg-orange-600', textColor: 'text-white' },
  green_white: { label: 'Green/White Belt', bgColor: 'bg-green-400', textColor: 'text-white' },
  green: { label: 'Green Belt', bgColor: 'bg-green-500', textColor: 'text-white' },
  green_black: { label: 'Green/Black Belt', bgColor: 'bg-green-600', textColor: 'text-white' },
};

// TODO: Replace with actual database query
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  beltRank: string;
  stripes: number;
  avatarUrl: string | null;
  memberships: Array<{
    id: string;
    status: string;
    program: {
      name: string;
      location: { name: string };
    };
  }>;
};

interface StudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) {
    return <div>Please sign in to view this student.</div>;
  }

  let student: Student | null = null;

  // First, check the students table (via parent relationship)
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
      const { data: studentRecord } = await supabaseAdmin
        .from('students')
        .select('id, first_name, last_name, date_of_birth, belt_rank, stripes, avatar_url, is_active')
        .eq('id', id)
        .eq('parent_id', parent.id)
        .neq('is_active', false)
        .single();

      if (studentRecord) {
        // Fetch active subscription with location for this user
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id, status, plan_name, location_id, locations(id, name)')
          .eq('clerk_user_id', userId)
          .eq('status', 'active')
          .single();

        const memberships: Student['memberships'] = [];
        if (subscription) {
          const loc = subscription.locations as unknown as { id: string; name: string } | null;
          memberships.push({
            id: subscription.id,
            status: subscription.status,
            program: {
              name: subscription.plan_name,
              location: { name: loc?.name || 'Location TBD' },
            },
          });
        }

        student = {
          id: studentRecord.id,
          firstName: studentRecord.first_name || '',
          lastName: studentRecord.last_name || '',
          dateOfBirth: studentRecord.date_of_birth ? new Date(studentRecord.date_of_birth) : null,
          beltRank: studentRecord.belt_rank || 'white',
          stripes: studentRecord.stripes || 0,
          avatarUrl: studentRecord.avatar_url || null,
          memberships,
        };
      }
    }
  }

  // If not found in students table, check signed_waivers
  if (!student) {
    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, child_date_of_birth, is_active')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .neq('is_active', false)
      .single();

    if (waiver) {
      const nameParts = (waiver.child_full_name ?? '').trim().split(' ').filter(Boolean);
      
      // Fetch active subscription with location for this user
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status, plan_name, location_id, locations(id, name)')
        .eq('clerk_user_id', userId)
        .eq('status', 'active')
        .single();

      const memberships: Student['memberships'] = [];
      if (subscription) {
        const loc = subscription.locations as unknown as { id: string; name: string } | null;
        memberships.push({
          id: subscription.id,
          status: subscription.status,
          program: {
            name: subscription.plan_name,
            location: { name: loc?.name || 'Location TBD' },
          },
        });
      }

      student = {
        id: waiver.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        dateOfBirth: waiver.child_date_of_birth ? new Date(waiver.child_date_of_birth) : null,
        beltRank: 'white',
        stripes: 0,
        avatarUrl: null,
        memberships,
      };
    }
  }

  // If still not found, check enrollments table
  if (!student) {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, child_date_of_birth, status')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .in('status', ['active', 'approved', 'pending'])
      .single();

    if (enrollment) {
      // Fetch active subscription with location for this user
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status, plan_name, location_id, locations(id, name)')
        .eq('clerk_user_id', userId)
        .eq('status', 'active')
        .single();

      const memberships: Student['memberships'] = [];
      if (subscription) {
        const loc = subscription.locations as unknown as { id: string; name: string } | null;
        memberships.push({
          id: subscription.id,
          status: subscription.status,
          program: {
            name: subscription.plan_name,
            location: { name: loc?.name || 'Location TBD' },
          },
        });
      }

      student = {
        id: enrollment.id,
        firstName: enrollment.child_first_name || '',
        lastName: enrollment.child_last_name || '',
        dateOfBirth: enrollment.child_date_of_birth ? new Date(enrollment.child_date_of_birth) : null,
        beltRank: 'white',
        stripes: 0,
        avatarUrl: null,
        memberships,
      };
    }
  }

  if (!student) {
    notFound();
  }

  const belt = beltConfig[student.beltRank] || beltConfig.white;
  const age = student.dateOfBirth
    ? Math.floor((Date.now() - student.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/students" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold">
                  {student.firstName} {student.lastName}
                </h1>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/students/${student.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                {age !== null ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {age} years old
                  </span>
                ) : null}
              </div>

              {/* Belt Display */}
              <div className="flex items-center gap-3 mt-4">
                <div
                  className={`px-4 py-2 rounded-lg ${belt.bgColor} ${belt.textColor} font-medium flex items-center gap-2`}
                >
                  <Award className="h-4 w-4" />
                  {belt.label}
                  {student.stripes > 0 && (
                    <span className="ml-2">• {student.stripes} stripe{student.stripes > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          {student.memberships.length > 0 ? (
            <div className="space-y-3">
              {student.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{membership.program.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {membership.program.location.name}
                    </p>
                  </div>
                  <Badge variant="success">{membership.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No active memberships.{' '}
              <Link href="/enroll" className="text-brand hover:underline">
                Enroll in a program
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone - Remove Student */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Remove this student</p>
              <p className="text-sm text-muted-foreground">
                Remove {student.firstName} from your account. This can be undone by contacting support.
              </p>
            </div>
            <RemoveStudentButton 
              studentId={student.id} 
              studentName={`${student.firstName} ${student.lastName}`} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
