'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Clock,
  User,
  Pin,
  Loader2,
  Shield,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  replyCount: number;
  author: {
    firstName: string;
    lastName: string;
    isAdmin: boolean;
  };
  location: {
    name: string;
  };
}

interface DiscussionsClientProps {
  locations: Location[];
  isAdmin: boolean;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DiscussionsClient({ locations, isAdmin }: DiscussionsClientProps) {
  const [activeLocation, setActiveLocation] = useState(locations[0]?.id || '');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinLoading, setPinLoading] = useState<string | null>(null);

  const fetchThreads = useCallback(async (locationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discussions?locationId=${locationId}`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      } else {
        setThreads([]);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeLocation) {
      fetchThreads(activeLocation);
    }
  }, [activeLocation, fetchThreads]);

  const handlePinToggle = async (threadId: string) => {
    setPinLoading(threadId);
    try {
      const res = await fetch(`/api/discussions/${threadId}/pin`, {
        method: 'POST',
      });
      if (res.ok) {
        // Refresh threads
        fetchThreads(activeLocation);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setPinLoading(null);
    }
  };

  const pinnedThreads = threads.filter((t) => t.isPinned);
  const regularThreads = threads.filter((t) => !t.isPinned);

  return (
    <div className="space-y-4">
      {/* Location Tabs */}
      <Tabs value={activeLocation} onValueChange={setActiveLocation}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            {locations.map((location) => (
              <TabsTrigger key={location.id} value={location.id}>
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <Button asChild>
            <Link href={`/dashboard/discussions/new?location=${activeLocation}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Thread
            </Link>
          </Button>
        </div>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Admin Notice */}
                {isAdmin && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <Shield className="h-4 w-4" />
                    <span>
                      Admin view: You can see all locations. Click the pin icon
                      on any thread to pin/unpin it.
                    </span>
                  </div>
                )}

                {/* Pinned Threads */}
                {pinnedThreads.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Pin className="h-4 w-4" />
                      Pinned
                    </h2>
                    {pinnedThreads.map((thread) => (
                      <ThreadCard
                        key={thread.id}
                        thread={thread}
                        isAdmin={isAdmin}
                        onPinToggle={handlePinToggle}
                        pinLoading={pinLoading === thread.id}
                      />
                    ))}
                  </div>
                )}

                {/* Regular Threads */}
                {regularThreads.length > 0 && (
                  <div className="space-y-3">
                    {pinnedThreads.length > 0 && (
                      <h2 className="text-sm font-medium text-muted-foreground">
                        Recent
                      </h2>
                    )}
                    {regularThreads.map((thread) => (
                      <ThreadCard
                        key={thread.id}
                        thread={thread}
                        isAdmin={isAdmin}
                        onPinToggle={handlePinToggle}
                        pinLoading={pinLoading === thread.id}
                      />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {threads.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No discussions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to start a conversation in {location.name}!
                      </p>
                      <Button asChild>
                        <Link
                          href={`/dashboard/discussions/new?location=${location.id}`}
                        >
                          Start a Discussion
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ThreadCardProps {
  thread: Thread;
  isAdmin: boolean;
  onPinToggle: (threadId: string) => void;
  pinLoading: boolean;
}

function ThreadCard({ thread, isAdmin, onPinToggle, pinLoading }: ThreadCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/dashboard/discussions/${thread.id}`}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {thread.isPinned && (
                <Badge variant="secondary" className="text-xs">
                  Pinned
                </Badge>
              )}
              {thread.isLocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
              {thread.author.isAdmin && (
                <Badge className="text-xs bg-brand/10 text-brand border-brand/20">
                  Admin
                </Badge>
              )}
              <h3 className="font-semibold text-foreground truncate">
                {thread.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {thread.content}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {thread.author.firstName} {thread.author.lastName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeAgo(thread.createdAt)}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Admin Pin Button */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPinToggle(thread.id)}
                disabled={pinLoading}
                className={thread.isPinned ? 'text-brand' : 'text-muted-foreground'}
              >
                {pinLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Reply Count */}
            <div className="text-center">
              <div className="text-lg font-bold text-brand">
                {thread.replyCount}
              </div>
              <div className="text-xs text-muted-foreground">replies</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
