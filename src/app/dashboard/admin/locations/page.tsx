import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';
import { LocationPinForm } from './location-pin-form';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminLocationsPage() {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug, address, city, state, access_pin, is_active')
    .order('name', { ascending: true });

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Header - Glassmorphism Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-500/25">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Locations
            </h1>
            <p className="text-slate-400 mt-1">
              Manage location PINs and community access
            </p>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="grid gap-5">
        {(locations || []).map((location, index) => {
          const colors = [
            { gradient: 'from-sky-400 to-blue-500', bg: 'from-sky-50/80 via-blue-50/60 to-indigo-50/40', text: 'text-sky-700' },
            { gradient: 'from-violet-400 to-purple-500', bg: 'from-violet-50/80 via-purple-50/60 to-fuchsia-50/40', text: 'text-violet-700' },
            { gradient: 'from-teal-400 to-emerald-500', bg: 'from-teal-50/80 via-emerald-50/60 to-green-50/40', text: 'text-teal-700' },
            { gradient: 'from-amber-400 to-orange-500', bg: 'from-amber-50/80 via-orange-50/60 to-yellow-50/40', text: 'text-amber-700' },
            { gradient: 'from-rose-400 to-pink-500', bg: 'from-rose-50/80 via-pink-50/60 to-fuchsia-50/40', text: 'text-rose-700' },
          ];
          const theme = colors[index % colors.length];
          
          return (
            <Card 
              key={location.id} 
              className={`relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br ${theme.bg} backdrop-blur-sm`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm`}>
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{location.name}</h3>
                      <p className="text-sm text-slate-500">
                        {location.address}, {location.city}, {location.state}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={location.is_active 
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 font-medium' 
                      : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0 font-medium'
                    }
                  >
                    {location.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Community PIN</p>
                    <p className={`font-mono text-2xl font-bold ${theme.text}`}>
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
                      variant="outline" 
                      size="sm" 
                      className="border-slate-200 hover:bg-white/50"
                      asChild
                    >
                      <Link href={`/community/${location.slug}`} target="_blank">
                        View Community
                        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!locations || locations.length === 0) && (
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 to-white/60 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100/80 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No locations found</p>
              <p className="text-sm text-slate-400 mt-1">Add your first location to get started</p>
              <Button className="mt-6 bg-gradient-to-r from-sky-400 to-blue-500 text-white border-0 shadow-sm">
                Add Location
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
