import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { isSuperAdmin } from '@/lib/admin-roles';
import { PlatformControlPanel } from './platform-control-panel';

export default async function SuperAdminPlatformPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // SECURITY: Only Super Admins can access this page
  // Currently: dangzr1@gmail.com and walkawayy@icloud.com
  if (!user || !email || !isSuperAdmin(email)) {
    redirect('/dashboard/admin');
  }

  const { data: status } = await supabaseAdmin
    .from('platform_status')
    .select('*')
    .limit(1)
    .single();

  const { data: logs } = await supabaseAdmin
    .from('platform_status_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header with breadcrumb and X */}
      <div className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/dashboard/admin" className="text-slate-500 hover:text-slate-700 transition-colors">
                Admin
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <Link href="/dashboard/admin/settings" className="text-slate-500 hover:text-slate-700 transition-colors">
                Settings
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <span className="text-slate-900 font-medium">Site Control</span>
            </nav>
            
            {/* X button - goes back to settings */}
            <Link
              href="/dashboard/admin/settings"
              className="h-8 w-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Main Control Panel */}
        <PlatformControlPanel
          initialStatus={status}
          logs={logs || []}
          adminEmail={email}
        />

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-12">
          Super Admin access only
        </p>
      </div>
    </div>
  );
}
