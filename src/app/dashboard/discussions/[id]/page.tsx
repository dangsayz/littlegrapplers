import Link from 'next/link';
import { ArrowLeft, MessageSquare, Clock, User, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// TODO: Replace with actual database query
const mockThread = {
  id: '1',
  title: 'Holiday Schedule Update - December Classes',
  content: `Hey everyone! Just wanted to give you a heads up about our holiday schedule for December.

We will be closed on the following dates:
- December 24th (Christmas Eve)
- December 25th (Christmas Day)
- December 31st (New Year's Eve)
- January 1st (New Year's Day)

All other classes will run as normal. If you have any questions, feel free to reply here or reach out directly.

Happy holidays to all our Little Grapplers families! 🥋`,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  isPinned: true,
  isLocked: false,
  author: { firstName: 'Coach', lastName: 'Mike' },
  program: { name: 'All Programs', location: { name: 'Austin HQ' } },
  replies: [
    {
      id: '1',
      content: 'Thanks for the heads up! Looking forward to classes resuming in January.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      author: { firstName: 'Jessica', lastName: 'Smith' },
    },
    {
      id: '2',
      content: 'Happy holidays everyone! See you all next year 🎉',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      author: { firstName: 'David', lastName: 'Lee' },
    },
  ],
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface DiscussionPageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscussionPage({ params }: DiscussionPageProps) {
  const { id } = await params;
  // TODO: Fetch actual thread by id
  const thread = mockThread;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/discussions" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Link>
      </Button>

      {/* Thread Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-2 flex-wrap mb-2">
            {thread.isPinned && (
              <Badge variant="secondary">Pinned</Badge>
            )}
            {thread.isLocked && (
              <Badge variant="outline">Locked</Badge>
            )}
          </div>
          <h1 className="text-xl font-display font-bold">{thread.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {thread.author.firstName} {thread.author.lastName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getTimeAgo(thread.createdAt)}
            </span>
            <span>{thread.program.name}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="whitespace-pre-wrap text-foreground">{thread.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand" />
          Replies ({thread.replies.length})
        </h2>

        {thread.replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {reply.author.firstName} {reply.author.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeAgo(reply.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-foreground">{reply.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <Card>
          <CardContent className="p-4">
            <form className="space-y-4">
              <Textarea
                placeholder="Write a reply..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Post Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
