import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Activity, Search, User, FileText, Settings, MapPin, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

const actionIcons: Record<string, typeof Activity> = {
  'user': User,
  'waiver': FileText,
  'settings': Settings,
  'location': MapPin,
  'thread': MessageSquare,
};

const actionColors: Record<string, string> = {
  'create': 'bg-green-100 text-green-800',
  'update': 'bg-blue-100 text-blue-800',
  'delete': 'bg-red-100 text-red-800',
  'login': 'bg-purple-100 text-purple-800',
};

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string };
}) {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch activity logs
  let query = supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchParams.search) {
    query = query.or(`action.ilike.%${searchParams.search}%,entity_type.ilike.%${searchParams.search}%`);
  }

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('entity_type', searchParams.type);
  }

  const { data: activities, error } = await query.limit(100);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActionBadge = (action: string) => {
    const actionType = action.split('.')[1] || action;
    const colorClass = actionColors[actionType] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{action}</Badge>;
  };

  const getIcon = (entityType: string) => {
    const Icon = actionIcons[entityType.toLowerCase()] || Activity;
    return <Icon className="h-4 w-4" />;
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Activity className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Activity Log
          </h1>
          <p className="text-muted-foreground">
            System activity and audit trail
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search activities..."
                defaultValue={searchParams.search || ''}
                className="pl-9"
              />
            </div>
            <select
              name="type"
              defaultValue={searchParams.type || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Types</option>
              <option value="user">Users</option>
              <option value="waiver">Waivers</option>
              <option value="location">Locations</option>
              <option value="thread">Discussions</option>
              <option value="settings">Settings</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {activities?.length || 0} activities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">Error loading activities: {error.message}</p>
          ) : !activities || activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No activity logs yet</p>
              <p className="text-sm text-muted-foreground/70">
                Activities will appear here as users interact with the platform.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: {
                id: string;
                action: string;
                entity_type: string;
                entity_id: string;
                details: Record<string, unknown> | null;
                actor_id: string | null;
                ip_address: string | null;
                created_at: string;
              }) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getIcon(activity.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(activity.action)}
                      <span className="text-sm text-muted-foreground">
                        on {activity.entity_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Entity ID: {activity.entity_id.slice(0, 8)}...
                    </p>
                    {activity.details && (
                      <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(activity.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </p>
                    {activity.ip_address && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        IP: {activity.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
