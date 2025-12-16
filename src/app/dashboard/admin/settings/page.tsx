import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Settings, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { supabaseAdmin } from '@/lib/supabase';
import { SettingsForm } from './settings-form';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminSettingsPage() {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch current settings
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('*');

  // Convert to key-value object
  const settingsMap: Record<string, unknown> = {};
  settings?.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  // Fetch recent activity logs
  const { data: recentActivity } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
          <Settings className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure global site settings
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <SettingsForm settings={settingsMap} />
        </div>

        {/* Activity Log */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Admin actions log</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {(recentActivity || []).map((activity) => (
                  <div key={activity.id} className="p-4">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.entity_type} • {formatDate(activity.created_at)}
                    </p>
                    {activity.admin_email && (
                      <p className="text-xs text-muted-foreground mt-1">
                        by {activity.admin_email}
                      </p>
                    )}
                  </div>
                ))}
                {(!recentActivity || recentActivity.length === 0) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
