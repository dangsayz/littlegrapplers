import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Users, ArrowRight, User, Sparkles, ChevronRight } from 'lucide-react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { LocationTeaser } from '@/components/dashboard';
import { StudentLocationLink } from '@/components/dashboard/student-location-link';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
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

  // Redirect admins to admin dashboard
  if (isAdmin) {
    redirect('/dashboard/admin');
  }

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
              // Get location info from student_locations table
              let locationName: string | undefined;
              let locationSlug: string | undefined;
              let locationPin: string | undefined;
              
              const { data: studentLocation } = await supabaseAdmin
                .from('student_locations')
                .select('location_id')
                .eq('student_id', s.id)
                .limit(1)
                .single();
              
              if (studentLocation?.location_id) {
                const { data: loc } = await supabaseAdmin
                  .from('locations')
                  .select('name, slug, access_pin')
                  .eq('id', studentLocation.location_id)
                  .single();
                locationName = loc?.name;
                locationSlug = loc?.slug;
                locationPin = loc?.access_pin;
              }
              
              students.push({
                id: s.id,
                firstName: s.first_name || '',
                lastName: s.last_name || '',
                beltRank: s.belt_rank || 'white',
                stripes: s.stripes || 0,
                locationName,
                locationSlug,
                locationPin,
              });
            }
          }
        }
      }
    }

    // Also check signed_waivers - search by clerk_user_id OR guardian_email
    const { data: waivers } = await supabaseAdmin
      .from('signed_waivers')
      .select('id, child_full_name, is_active, location_id, clerk_user_id')
      .or(`clerk_user_id.eq.${userId},guardian_email.eq.${userEmail}`)
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

    // Also check enrollments table (new enrollment system) - search by clerk_user_id OR guardian_email
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, status, location_id, clerk_user_id, guardian_email')
      .or(`clerk_user_id.eq.${userId},guardian_email.eq.${userEmail}`)
      .in('status', ['active', 'approved', 'pending', 'pending_payment']);

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

  // Collect unique location IDs from enrolled students
  const enrolledLocationIds = new Set<string>();
  for (const student of students) {
    if (student.locationSlug) {
      // We have location slug but need ID - we'll fetch by slug
    }
  }

  // Fetch locations with their latest activity - prioritize parent's enrolled locations
  const pinnedLocations: PinnedLocation[] = [];
  
  // First, get locations where parent has enrolled children (from students array)
  const parentLocationSlugs = students
    .filter(s => s.locationSlug)
    .map(s => s.locationSlug as string);
  const uniqueParentSlugs = [...new Set(parentLocationSlugs)];

  if (uniqueParentSlugs.length > 0) {
    // Fetch parent's enrolled locations first
    const { data: parentLocations } = await supabaseAdmin
      .from('locations')
      .select('id, name, slug, city, state, access_pin')
      .in('slug', uniqueParentSlugs)
      .eq('is_active', true);

    if (parentLocations) {
      for (const loc of parentLocations) {
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
  }

  // If no enrolled locations, show general active locations
  if (pinnedLocations.length === 0) {
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
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header - Clean & Bold */}
      <div className="pt-4 pb-6">
        <h1 className="text-3xl font-display font-semibold text-slate-900 tracking-tight">
          Hi, {firstName}
        </h1>
        <p className="text-slate-500 mt-1">
          {hasStudents 
            ? `You have ${students.length} student${students.length > 1 ? 's' : ''} enrolled`
            : 'Get started by enrolling your child'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Students */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Students</h2>
              {hasStudents && (
                <Link href="/enroll" className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Link>
              )}
            </div>
            
            {hasStudents ? (
              <div className="space-y-2">
                {students.map((student) => (
                  <Link key={student.id} href={`/dashboard/students/${student.id}`}>
                    <Card className="border border-slate-200/60 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/50 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-slate-900">
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
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="relative overflow-hidden border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900">No students yet</h3>
                  <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">
                    Enroll your child to join classes and access the community
                  </p>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
                    <Link href="/enroll">
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll Your Child
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Community Locations */}
          {pinnedLocations.length > 0 && (
            <LocationTeaser locations={pinnedLocations} isAdmin={isAdmin} />
          )}
        </div>

        {/* Sidebar - Activity Feed */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Recent Activity</h2>
            </div>
            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-2">
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
