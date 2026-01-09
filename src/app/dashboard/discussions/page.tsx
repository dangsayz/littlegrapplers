import { auth, currentUser } from '@clerk/nextjs/server';
import { MessageSquare } from 'lucide-react';
import { ADMIN_EMAILS } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';
import { DiscussionsClient } from './discussions-client';

export default async function DiscussionsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  // Fetch all locations from Supabase
  const { data: locationsData } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug')
    .order('name');

  // SINGLE SOURCE OF TRUTH: Get user's location from enrollments (for non-admins)
  // enrollment.location_id is the authoritative reference for student-location assignment
  let userLocationIds: string[] = [];
  if (!isAdmin && userId) {
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('location_id')
      .eq('clerk_user_id', userId)
      .in('status', ['approved', 'active']);
    
    userLocationIds = enrollments?.map(e => e.location_id).filter(Boolean) || [];
  }

  // Filter locations: admins see all, users only see their enrolled location
  const allLocations = (locationsData || []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
  }));

  // If user has locations, only show those. If no location found, show all (fallback)
  const locations = isAdmin || userLocationIds.length === 0
    ? allLocations 
    : allLocations.filter(loc => userLocationIds.includes(loc.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-brand" />
          Discussions
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect with other parents and coaches at your location
        </p>
      </div>

      {/* Client-side discussions with location tabs */}
      <DiscussionsClient locations={locations} isAdmin={isAdmin} />
    </div>
  );
}
