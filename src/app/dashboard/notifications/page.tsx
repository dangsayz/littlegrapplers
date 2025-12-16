import { currentUser } from '@clerk/nextjs/server';
import { Bell } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/constants';
import { NotificationsClient } from './notifications-client';

export default async function NotificationsPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === ADMIN_EMAIL;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Review activity and approve membership requests
        </p>
      </div>

      <NotificationsClient />
    </div>
  );
}
