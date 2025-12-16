import Link from 'next/link';
import { Bell, Plus, Pencil, Trophy, Calendar, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

type AnnouncementType = 'general' | 'student_of_month' | 'event' | 'schedule_change';

const typeConfig: Record<AnnouncementType, { icon: typeof Bell; label: string; color: string }> = {
  general: { icon: Bell, label: 'General', color: 'bg-blue-100 text-blue-700' },
  student_of_month: { icon: Trophy, label: 'Student of Month', color: 'bg-yellow-100 text-yellow-700' },
  event: { icon: Calendar, label: 'Event', color: 'bg-green-100 text-green-700' },
  schedule_change: { icon: Clock, label: 'Schedule', color: 'bg-orange-100 text-orange-700' },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatus(publishAt: Date, expiresAt: Date | null): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const now = new Date();
  if (publishAt > now) {
    return { label: 'Scheduled', variant: 'secondary' };
  }
  if (expiresAt && expiresAt < now) {
    return { label: 'Expired', variant: 'outline' };
  }
  return { label: 'Published', variant: 'default' };
}

async function getAnnouncements() {
  return prisma.announcement.findMany({
    include: {
      studentOfMonth: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { publishAt: 'desc' },
  });
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage announcements and updates
          </p>
        </div>
        <Button asChild>
          <Link href={"/dashboard/admin/announcements/new" as never}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {announcements.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No announcements yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Create your first announcement to share with parents.
              </p>
              <Button asChild>
                <Link href={"/dashboard/admin/announcements/new" as never}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Announcement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => {
                  const config = typeConfig[announcement.type as AnnouncementType] || typeConfig.general;
                  const Icon = config.icon;
                  const status = getStatus(announcement.publishAt, announcement.expiresAt);

                  return (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{announcement.title}</p>
                          {announcement.type === 'student_of_month' && announcement.studentOfMonth && (
                            <p className="text-sm text-muted-foreground">
                              {announcement.studentOfMonth.firstName} {announcement.studentOfMonth.lastName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(announcement.publishAt)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/admin/announcements/${announcement.id}` as never}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
