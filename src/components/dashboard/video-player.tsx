'use client';

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string | null;
}

function getVideoEmbedUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    return {
      type: 'direct',
      embedUrl: url,
    };
  }

  return null;
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
}

export function VideoPlayer({ videoUrl, title, thumbnailUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoInfo = getVideoEmbedUrl(videoUrl);
  const thumbnail = thumbnailUrl || getYouTubeThumbnail(videoUrl) || '/images/video-placeholder.jpg';

  if (!videoInfo) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Unable to embed this video</p>
        <Button asChild variant="outline">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in new tab
          </a>
        </Button>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div
        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center transform transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    );
  }

  if (videoInfo.type === 'direct') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          src={videoInfo.embedUrl}
          controls
          autoPlay
          className="w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={videoInfo.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
