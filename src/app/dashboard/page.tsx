import Link from 'next/link';
import { Plus, Users, ArrowRight, User } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { LocationTeaser } from '@/components/dashboard';
import { StudentLocationLink } from '@/components/dashboard/student-location-link';
import { ADMIN_EMAILS } from '@/lib/constants';

interface StudentDisplay {
  id: string;
  firstName: string;
  lastName: string;
  beltRank: string;
  stripes: number;
  locationName?: string;
  locationSlug?: string;
  locationPin?: string;
}

interface LocationActivity {
  id: string;
  title: string;
  createdAt: string;
  authorEmail: string;
}

interface PinnedLocation {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  accessPin: string | null;
  latestActivity: LocationActivity | null;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName || 'there';
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

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

    // Also check signed_waivers
    const { data: waivers } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, is_active, location_id')
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
          // Get location details if location_id exists
          let locationName: string | undefined;
          let locationSlug: string | undefined;
          let locationPin: string | undefined;
          if (w.location_id) {
            const { data: loc } = await supabaseAdmin
              .from('locations')
              .select('name, slug, access_pin')
              .eq('id', w.location_id)
              .single();
            locationName = loc?.name;
            locationSlug = loc?.slug;
            locationPin = loc?.access_pin;
          }
          students.push({
            id: w.id,
            firstName: fName,
            lastName: lName,
            beltRank: 'white',
            stripes: 0,
            locationName,
            locationSlug,
            locationPin,
          });
        }
      }
    }

    // Also check enrollments table (new enrollment system)
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, status, location_id')
      .eq('clerk_user_id', userId)
      .in('status', ['active', 'approved', 'pending']);

    if (enrollments) {
      for (const e of enrollments) {
        const key = `${(e.child_first_name || '').toLowerCase()}-${(e.child_last_name || '').toLowerCase()}`;
        if (!seenNames.has(key)) {
          seenNames.add(key);
          // Get location details if location_id exists
          let locationName: string | undefined;
          let locationSlug: string | undefined;
          let locationPin: string | undefined;
          if (e.location_id) {
            const { data: loc } = await supabaseAdmin
              .from('locations')
              .select('name, slug, access_pin')
              .eq('id', e.location_id)
              .single();
            locationName = loc?.name;
            locationSlug = loc?.slug;
            locationPin = loc?.access_pin;
          }
          students.push({
            id: e.id,
            firstName: e.child_first_name || '',
            lastName: e.child_last_name || '',
            beltRank: 'white',
            stripes: 0,
            locationName,
            locationSlug,
            locationPin,
          });
        }
      }
    }
  }

  const hasStudents = students.length > 0;

  // Fetch locations with their latest activity
  const pinnedLocations: PinnedLocation[] = [];
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug, city, state, access_pin')
    .eq('is_active', true)
    .limit(3);

  if (locations) {
    for (const loc of locations) {
      const { data: latestThread } = await supabaseAdmin
        .from('discussion_threads')
        .select('id, title, created_at, author_email')
        .eq('location_id', loc.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      pinnedLocations.push({
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
        city: loc.city,
        state: loc.state,
        accessPin: loc.access_pin,
        latestActivity: latestThread ? {
          id: latestThread.id,
          title: latestThread.title,
          createdAt: latestThread.created_at,
          authorEmail: latestThread.author_email,
        } : null,
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Welcome Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative text-center">
          <h1 className="text-3xl font-display font-bold text-white">
            Hi, {firstName}
          </h1>
          <p className="text-slate-400 mt-2">
            {hasStudents 
              ? `You have ${students.length} student${students.length > 1 ? 's' : ''} enrolled`
              : 'Get started by adding your first student'
            }
          </p>
        </div>
      </div>

      {/* Students List - Glass Cards */}
      <div className="space-y-3">
        {hasStudents ? (
          <>
            {students.map((student, index) => {
              const colors = [
                { gradient: 'from-teal-400 to-emerald-500', bg: 'from-teal-50/80 via-emerald-50/60 to-green-50/40', text: 'text-teal-700' },
                { gradient: 'from-sky-400 to-blue-500', bg: 'from-sky-50/80 via-blue-50/60 to-indigo-50/40', text: 'text-sky-700' },
                { gradient: 'from-violet-400 to-purple-500', bg: 'from-violet-50/80 via-purple-50/60 to-fuchsia-50/40', text: 'text-violet-700' },
                { gradient: 'from-amber-400 to-orange-500', bg: 'from-amber-50/80 via-orange-50/60 to-yellow-50/40', text: 'text-amber-700' },
              ];
              const theme = colors[index % colors.length];
              
              return (
                <Link key={student.id} href={`/dashboard/students/${student.id}`}>
                  <Card className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${theme.bg} backdrop-blur-sm hover:shadow-md transition-all cursor-pointer`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <CardContent className="p-4 relative">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${theme.text}`}>
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-slate-500 capitalize">
                            {student.beltRank.replace('_', ' ')} Belt
                            {student.stripes > 0 && ` · ${student.stripes} stripe${student.stripes > 1 ? 's' : ''}`}
                          </p>
                          {student.locationName && student.locationSlug && (
                            <StudentLocationLink
                              locationName={student.locationName}
                              locationSlug={student.locationSlug}
                              locationPin={student.locationPin}
                            />
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </>
        ) : (
          <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-8 text-center relative">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-gray-300 flex items-center justify-center mb-4 shadow-sm">
                <Users className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-700">No students yet</h3>
              <p className="text-slate-500 mb-6">
                Add your child to get started with classes
              </p>
              <Button size="lg" className="bg-gradient-to-r from-teal-400 to-emerald-500 text-white border-0 shadow-sm" asChild>
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
          <Button variant="outline" className="border-slate-200 hover:bg-white/50" asChild>
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Student
            </Link>
          </Button>
        </div>
      )}

      {/* Locations Teaser */}
      {pinnedLocations.length > 0 && (
        <LocationTeaser locations={pinnedLocations} isAdmin={isAdmin} />
      )}
    </div>
  );
}
