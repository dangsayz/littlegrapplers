'use client';

import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
    category: string;
    videoUrl: string;
  };
  href?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export function VideoCard({ video, href }: VideoCardProps) {
  const thumbnail =
    video.thumbnailUrl || getYouTubeThumbnail(video.videoUrl) || '/images/video-placeholder.jpg';

  const linkHref = href || `/dashboard/videos/${video.id}`;

  return (
    <Link href={linkHref as never}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-brand/30">
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
              <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
            </div>
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors">
            {video.title}
          </h3>
          <Badge variant="secondary" className="mt-2 text-xs">
            {video.category}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
