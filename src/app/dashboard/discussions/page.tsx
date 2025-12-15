import { currentUser } from '@clerk/nextjs/server';
import { MessageSquare } from 'lucide-react';
import { ADMIN_EMAIL, DISCUSSION_LOCATIONS } from '@/lib/constants';
import { DiscussionsClient } from './discussions-client';

export default async function DiscussionsPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === ADMIN_EMAIL;

  // For now, use the static locations. In production, these would come from the database.
  const locations = DISCUSSION_LOCATIONS.map((loc) => ({
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
