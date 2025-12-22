import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Award, Calendar, Edit } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';

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

  const { data: waiver, error } = await supabaseAdmin
    .from('signed_waivers')
    .select('id, child_full_name, child_date_of_birth')
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .single();

  if (error || !waiver) {
    notFound();
  }

  const nameParts = (waiver.child_full_name ?? '').trim().split(' ').filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const student: Student = {
    id: waiver.id,
    firstName,
    lastName,
    dateOfBirth: waiver.child_date_of_birth ? new Date(waiver.child_date_of_birth) : null,
    beltRank: 'white',
    stripes: 0,
    avatarUrl: null,
    memberships: [],
  };

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
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
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
              <Link href="/dashboard/memberships/new" className="text-brand hover:underline">
                Enroll in a program
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
