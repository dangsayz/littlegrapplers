import { currentUser } from '@clerk/nextjs/server';
import { Bell } from 'lucide-react';
import { ADMIN_EMAILS } from '@/lib/constants';
import { NotificationsClient } from './notifications-client';

export default async function NotificationsPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <Bell className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Notifications
            </h1>
            <p className="text-slate-400 mt-1">
              Review activity and approve membership requests
            </p>
          </div>
        </div>
      </div>

      <NotificationsClient />
    </div>
  );
}
