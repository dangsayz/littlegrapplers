import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Flag, Eye, EyeOff, Pin, Trash2, Lock, Unlock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThreadActions } from './thread-actions';


export default async function AdminCommunityPage() {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  // Fetch all threads with location info
  const { data: threads } = await supabaseAdmin
    .from('discussion_threads')
    .select(`
      *,
      locations(name, slug),
      discussion_replies(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch reported content
  const { data: reports } = await supabaseAdmin
    .from('content_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20);

  // Stats
  const { count: totalThreads } = await supabaseAdmin
    .from('discussion_threads')
    .select('*', { count: 'exact', head: true });

  const { count: hiddenThreads } = await supabaseAdmin
    .from('discussion_threads')
    .select('*', { count: 'exact', head: true })
    .eq('is_hidden', true);

  const { count: pendingReports } = await supabaseAdmin
    .from('content_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm">
            <MessageSquare className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Community
            </h1>
            <p className="text-slate-400 mt-1">
              Moderate discussions and manage reported content
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-green-700">{totalThreads || 0}</div>
            <p className="text-sm text-slate-500">Total Threads</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-amber-700">{hiddenThreads || 0}</div>
            <p className="text-sm text-slate-500">Hidden</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border border-white/60 shadow-sm bg-gradient-to-br from-rose-50/80 via-red-50/60 to-pink-50/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="text-3xl font-bold text-rose-700">{pendingReports || 0}</div>
            <p className="text-sm text-slate-500">Pending Reports</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threads">All Threads</TabsTrigger>
          <TabsTrigger value="reports" className="relative">
            Reports
            {(pendingReports || 0) > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {pendingReports}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          {(threads || []).map((thread) => (
            <Card key={thread.id} className={thread.is_hidden ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {thread.locations?.name || 'Unknown Location'}
                      </Badge>
                      {thread.is_pinned && (
                        <Badge className="bg-brand text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {thread.is_locked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {thread.is_hidden && (
                        <Badge variant="destructive" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{thread.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      by {thread.author_email} • {formatDate(thread.created_at)}
                    </CardDescription>
                  </div>
                  <ThreadActions thread={thread} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {thread.content}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{thread.discussion_replies?.[0]?.count || 0} replies</span>
                  <Link 
                    href={`/community/${thread.locations?.slug}/thread/${thread.id}`}
                    target="_blank"
                    className="text-brand hover:underline"
                  >
                    View Thread →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!threads || threads.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No discussion threads yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {(reports || []).map((report) => (
            <Card key={report.id} className="border-orange-500/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-500" />
                    <Badge variant="outline" className="capitalize">
                      {report.reason.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {report.content_type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  <span className="text-muted-foreground">Reported by:</span> {report.reporter_email}
                </p>
                {report.details && (
                  <p className="text-sm text-muted-foreground italic">
                    "{report.details}"
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    View Content
                  </Button>
                  <Button size="sm" variant="destructive">
                    Hide Content
                  </Button>
                  <Button size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!reports || reports.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Flag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No pending reports</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
