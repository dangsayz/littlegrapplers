import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayer, VideoCard } from '@/components/dashboard';
import prisma from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function getVideo(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: {
      programs: {
        include: {
          program: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function getRelatedVideos(category: string, currentId: string) {
  return prisma.video.findMany({
    where: {
      category,
      id: { not: currentId },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getRelatedVideos(video.category, video.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/dashboard/videos" as never}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            videoUrl={video.videoUrl}
            title={video.title}
            thumbnailUrl={video.thumbnailUrl}
          />

          <div>
            <h1 className="text-2xl font-display font-bold">{video.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {video.category}
              </Badge>
              {video.duration && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>
          </div>

          {video.description && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Related Videos</h2>
          {relatedVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No related videos found.</p>
          ) : (
            <div className="space-y-3">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
