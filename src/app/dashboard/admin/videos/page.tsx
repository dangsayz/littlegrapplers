import Link from 'next/link';
import { Video, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import prisma from '@/lib/db';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function getVideos() {
  return prisma.video.findMany({
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
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-brand" />
            Video Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage training videos and tutorials
          </p>
        </div>
        <Button asChild>
          <Link href={"/dashboard/admin/videos/new" as never}>
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {videos.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No videos yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Add your first training video to get started.
              </p>
              <Button asChild>
                <Link href={"/dashboard/admin/videos/new" as never}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{video.title}</p>
                          {video.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{video.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {video.duration ? formatDuration(video.duration) : '-'}
                    </TableCell>
                    <TableCell>
                      {video.isPublic ? (
                        <Badge variant="default" className="bg-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Members Only
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/admin/videos/${video.id}` as never}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
