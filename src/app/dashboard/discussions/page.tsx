import { currentUser } from '@clerk/nextjs/server';
import { MessageSquare } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';
import { DiscussionsClient } from './discussions-client';

export default async function DiscussionsPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === ADMIN_EMAIL;

  // Fetch real locations from Supabase
  const { data: locationsData } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug')
    .order('name');

  const locations = (locationsData || []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
  }));

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
