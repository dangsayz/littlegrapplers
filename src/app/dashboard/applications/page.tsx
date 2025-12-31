import { auth } from '@clerk/nextjs/server';
import { FileText, Calendar, MapPin, Clock, CheckCircle, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';

interface WaiverApplication {
  id: string;
  guardian_full_name: string;
  guardian_email: string;
  child_full_name: string;
  child_date_of_birth: string | null;
  signed_at: string;
  location_id: string | null;
  location_name?: string;
  photo_media_consent: boolean;
  is_active: boolean;
}

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to view your applications.</div>;
  }

  // Fetch all waivers/applications for this user
  const { data: waivers, error } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('signed_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  }

  // Fetch locations to map IDs to names
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name');

  const locationMap = new Map(
    (locations || []).map((loc: { id: string; name: string }) => [loc.id, loc.name])
  );

  // Enrich waivers with location names
  const applications: WaiverApplication[] = (waivers || []).map((waiver: WaiverApplication) => ({
    ...waiver,
    location_name: waiver.location_id ? locationMap.get(waiver.location_id) || 'Unknown Location' : 'Not specified',
  }));

  const hasApplications = applications.length > 0;

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-brand" />
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1">
          View all waivers and applications you&apos;ve submitted
        </p>
      </div>

      {/* Applications List */}
      {hasApplications ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const { date, time } = formatDateTime(app.signed_at);
            return (
              <Card key={app.id} className={!app.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left Side - Main Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={app.is_active ? 'default' : 'secondary'}>
                          {app.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {app.photo_media_consent && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Photo Consent
                          </Badge>
                        )}
                      </div>

                      {/* Child Info */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-brand" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{app.child_full_name}</h3>
                          {app.child_date_of_birth && (
                            <p className="text-sm text-muted-foreground">
                              DOB: {new Date(app.child_date_of_birth).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Guardian */}
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Guardian:</span> {app.guardian_full_name}
                        <span className="mx-2">|</span>
                        {app.guardian_email}
                      </div>
                    </div>

                    {/* Right Side - Date/Time/Location */}
                    <div className="md:text-right space-y-2 md:min-w-[200px]">
                      <div className="flex items-center gap-2 md:justify-end">
                        <MapPin className="h-4 w-4 text-brand" />
                        <span className="font-medium">{app.location_name}</span>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{date}</span>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{time}</span>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Signed & Submitted</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No applications yet</h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any waivers or applications yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {hasApplications && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total Applications: <span className="font-semibold text-foreground">{applications.length}</span>
              </span>
              <span className="text-muted-foreground">
                Active: <span className="font-semibold text-green-600">{applications.filter(a => a.is_active).length}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
