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
    <div className="space-y-8">
      {/* Page Header - Apple Glass Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                Announcements
              </h1>
              <p className="text-slate-400 mt-1">
                Manage announcements and updates
              </p>
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm">
            <Link href={"/dashboard/admin/announcements/new" as never}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-0 overflow-x-auto">
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
            <Table className="min-w-[600px]">
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
