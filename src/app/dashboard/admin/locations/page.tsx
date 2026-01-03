import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { LocationPinForm } from './location-pin-form';


export default async function AdminLocationsPage() {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug, address, city, state, access_pin, is_active')
    .order('name', { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Admin
      </Link>

      {/* Page Header - Clean Apple Style */}
      <div className="pb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Locations
        </h1>
        <p className="text-slate-500 mt-1">
          Manage location PINs and community access
        </p>
      </div>

      {/* Locations List - Clean Cards */}
      <div className="space-y-3">
        {(locations || []).map((location) => (
          <div 
            key={location.id} 
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{location.name}</h3>
                    <p className="text-sm text-slate-500">
                      {location.address}, {location.city}, {location.state}
                    </p>
                  </div>
                </div>
                <span 
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    location.is_active 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">PIN</p>
                  <p className="font-mono text-xl font-semibold text-slate-900 tracking-wider">
                    {location.access_pin || '----'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LocationPinForm 
                    locationId={location.id} 
                    locationName={location.name}
                    currentPin={location.access_pin || ''} 
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    asChild
                  >
                    <Link href={`/community/${location.slug}`} target="_blank">
                      View
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!locations || locations.length === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium">No locations yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first location to get started</p>
              <Button className="mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
                Add Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
