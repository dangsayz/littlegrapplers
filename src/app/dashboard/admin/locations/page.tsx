import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { MapPin, ExternalLink, WifiOff, Users, CheckCircle, MessageSquare, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { LocationPinForm } from './location-pin-form';
import { LocationToggle } from './location-toggle';
import { isSuperAdmin } from '@/lib/admin-roles';


export default async function AdminLocationsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  
  if (!user || !email || !ADMIN_EMAILS.includes(email)) {
    redirect('/dashboard');
  }

  const userIsSuperAdmin = isSuperAdmin(email);

  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug, address, city, state, access_pin, is_active')
    .order('name', { ascending: true });

  // Get student counts per location
  const { data: studentCounts } = await supabaseAdmin
    .from('signed_waivers')
    .select('location_id');

  // Get thread counts per location  
  const { data: threadCounts } = await supabaseAdmin
    .from('discussion_threads')
    .select('location_id');

  // Build counts map
  const studentsByLocation = (studentCounts || []).reduce((acc, s) => {
    acc[s.location_id] = (acc[s.location_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const threadsByLocation = (threadCounts || []).reduce((acc, t) => {
    acc[t.location_id] = (acc[t.location_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLocations = locations?.length || 0;
  const activeLocations = locations?.filter(l => l.is_active).length || 0;
  const offlineLocations = totalLocations - activeLocations;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Locations' },
        ]}
      />

      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
            <p className="text-slate-500">{totalLocations} locations across all communities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            {activeLocations} Active
          </span>
          {offlineLocations > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
              <WifiOff className="h-4 w-4" />
              {offlineLocations} Offline
            </span>
          )}
        </div>
      </div>

      {/* Locations List */}
      <div className="grid gap-4">
        {(locations || []).map((location, index) => {
          const appleGradients = [
            'bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600',
            'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500',
            'bg-gradient-to-br from-pink-400 via-rose-500 to-red-400',
            'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
            'bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500',
            'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500',
          ];
          const offlineGradient = 'bg-gradient-to-br from-gray-300 via-slate-300 to-gray-400';
          const activeGradient = appleGradients[index % appleGradients.length];
          
          return (
          <div 
            key={location.id} 
            className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl ring-1 ring-white/20 shadow-lg"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 ${
              location.is_active ? activeGradient : offlineGradient
            }`} />
            
            {/* Glass overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
            
            {/* Decorative light reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                {/* Left Side */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {location.is_active ? (
                      <MapPin className="h-7 w-7 text-white" />
                    ) : (
                      <WifiOff className="h-7 w-7 text-white/80" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{location.name}</h3>
                      {location.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/30 text-white backdrop-blur-sm">
                          <WifiOff className="h-3 w-3" />
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">
                      {location.address}, {location.city}, {location.state}
                    </p>
                  </div>
                </div>

                {/* Right Side - PIN Badge */}
                <div className="text-right">
                  <div className="inline-flex flex-col items-end bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <span className="text-xs font-medium text-white/60 uppercase tracking-wider mb-1">Access PIN</span>
                    <span className="font-mono text-3xl font-bold text-white tracking-widest">
                      {location.access_pin || '----'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{studentsByLocation[location.id] || 0}</p>
                    <p className="text-xs text-white/60">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{threadsByLocation[location.id] || 0}</p>
                    <p className="text-xs text-white/60">Discussions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{location.is_active ? 'Open' : 'Closed'}</p>
                    <p className="text-xs text-white/60">Enrollment</p>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                <LocationToggle
                  locationId={location.id}
                  locationName={location.name}
                  isActive={location.is_active}
                  isSuperAdmin={userIsSuperAdmin}
                />
                <LocationPinForm 
                  locationId={location.id} 
                  locationName={location.name}
                  currentPin={location.access_pin || ''} 
                />
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                  asChild
                >
                  <Link href={`/community/${location.slug}`} target="_blank">
                    View Community
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
        })}

        {(!locations || locations.length === 0) && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <div className="py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-orange-400" />
              </div>
              <p className="text-slate-900 font-medium">No locations yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first location to get started</p>
              <Button className="mt-6 bg-gradient-to-r from-orange-400 to-amber-500 text-white border-0 shadow-sm rounded-full px-6">
                Add Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
