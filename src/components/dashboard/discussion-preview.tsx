import Link from 'next/link';
import { MessageSquare, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiscussionThread {
  id: string;
  title: string;
  createdAt: Date | string;
  isPinned: boolean;
  replyCount: number;
  author: {
    firstName?: string;
    lastName?: string;
  };
  program?: {
    name: string;
    location: {
      name: string;
    };
  } | null;
}

interface DiscussionPreviewProps {
  threads: DiscussionThread[];
  locationName?: string;
}

export function DiscussionPreview({ threads, locationName }: DiscussionPreviewProps) {
  const displayThreads = threads.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            Discussions
          </CardTitle>
          {locationName && (
            <p className="text-sm text-muted-foreground mt-1">
              From {locationName}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/discussions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {displayThreads.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No discussions yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayThreads.map((thread) => {
              const timeAgo = getTimeAgo(new Date(thread.createdAt));
              return (
                <Link
                  key={thread.id}
                  href={`/dashboard/discussions/${thread.id}`}
                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {thread.isPinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                        <h4 className="font-medium text-sm truncate">
                          {thread.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {thread.author.firstName || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo}
                        </span>
                        <span>{thread.replyCount} replies</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Empty state component
export function NoDiscussionsAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand" />
          Discussions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Enroll in a program to access location-based discussions.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/memberships">View Memberships</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
