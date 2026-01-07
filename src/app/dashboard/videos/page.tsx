import { Video, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoCard } from '@/components/dashboard';
import prisma from '@/lib/db';
import { VIDEO_CATEGORIES } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getVideos(category?: string, userLocationIds?: string[]) {
  const where: Record<string, unknown> = {};
  if (category && category !== 'all') {
    where.category = category;
  }

  const videos = await prisma.video.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  // If no location filter needed, return all videos
  if (!userLocationIds || userLocationIds.length === 0) {
    return videos;
  }

  // Get video location assignments from Supabase
  const { data: videoLocations } = await supabaseAdmin
    .from('video_locations')
    .select('video_id, location_id, all_locations');

  // Filter videos based on location access
  return videos.filter((video) => {
    const assignments = videoLocations?.filter((vl) => vl.video_id === video.id) || [];
    
    // No assignments = show to everyone (legacy videos)
    if (assignments.length === 0) return true;
    
    // Check if marked for all locations
    if (assignments.some((a) => a.all_locations)) return true;
    
    // Check if user's location matches
    return assignments.some((a) => a.location_id && userLocationIds.includes(a.location_id));
  });
}

async function getUserLocationIds(): Promise<string[]> {
  const user = await currentUser();
  if (!user) return [];

  // Get user's students and their locations
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single();

  if (!userData) return [];

  const { data: parent } = await supabaseAdmin
    .from('parents')
    .select('id')
    .eq('user_id', userData.id)
    .single();

  if (!parent) return [];

  const { data: studentLocations } = await supabaseAdmin
    .from('student_locations')
    .select('location_id, students!inner(parent_id)')
    .eq('students.parent_id', parent.id);

  return studentLocations?.map((sl) => sl.location_id).filter(Boolean) || [];
}

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function VideosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const userLocationIds = await getUserLocationIds();
  const videos = await getVideos(category, userLocationIds);

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
