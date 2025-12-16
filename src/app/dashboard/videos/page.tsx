import { Video, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoCard } from '@/components/dashboard';
import prisma from '@/lib/db';
import { VIDEO_CATEGORIES } from '@/lib/constants';

async function getVideos(category?: string) {
  const where: Record<string, unknown> = {};
  if (category && category !== 'all') {
    where.category = category;
  }

  return prisma.video.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function VideosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const videos = await getVideos(category);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-brand" />
            Video Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Training videos and technique tutorials
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/dashboard/videos">
          <Badge
            variant={!category || category === 'all' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-brand/90"
          >
            All
          </Badge>
        </a>
        {VIDEO_CATEGORIES.map((cat) => (
          <a key={cat} href={`/dashboard/videos?category=${encodeURIComponent(cat)}`}>
            <Badge
              variant={category === cat ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-brand/90"
            >
              {cat}
            </Badge>
          </a>
        ))}
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No videos available</h3>
            <p className="text-muted-foreground mt-1">
              {category
                ? `No videos found in the "${category}" category.`
                : 'Check back soon for new training content.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
