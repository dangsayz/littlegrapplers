import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          <MapPin className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Manage Locations
          </h1>
          <p className="text-muted-foreground">
            Set and update PIN codes for location community pages
          </p>
        </div>
      </div>

      {/* Locations List */}
      <div className="grid gap-4">
        {(locations || []).map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription>
                    {location.address}, {location.city}, {location.state}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {location.is_active ? (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/10 text-red-600 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Community PIN</p>
                  <p className="font-mono text-lg font-bold">
                    {location.access_pin || '(Not Set)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LocationPinForm 
                    locationId={location.id} 
                    locationName={location.name}
                    currentPin={location.access_pin || ''} 
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/community/${location.slug}`} target="_blank">
                      View Community
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!locations || locations.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No locations found</p>
              <Button className="mt-4">Add Location</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
