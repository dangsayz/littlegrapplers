import { Bell, Trophy, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnnouncementCard, NoAnnouncementsCard } from '@/components/dashboard/announcement-card';
import prisma from '@/lib/db';

type AnnouncementType = 'general' | 'student_of_month' | 'event' | 'schedule_change';

const typeFilters: { value: string; label: string; icon: typeof Bell }[] = [
  { value: 'all', label: 'All', icon: Bell },
  { value: 'general', label: 'General', icon: Bell },
  { value: 'student_of_month', label: 'Student of the Month', icon: Trophy },
  { value: 'event', label: 'Events', icon: Calendar },
  { value: 'schedule_change', label: 'Schedule Changes', icon: Clock },
];

async function getAnnouncements(type?: string) {
  const now = new Date();
  const where: Record<string, unknown> = {
    publishAt: { lte: now },
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: now } },
    ],
  };

  if (type && type !== 'all') {
    where.type = type;
  }

  return prisma.announcement.findMany({
    where,
    include: {
      studentOfMonth: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { publishAt: 'desc' },
  });
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeFilter = params.type || 'all';
  const announcements = await getAnnouncements(typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand" />
          Announcements
        </h1>
        <p className="text-muted-foreground mt-1">
          Updates and news from Little Grapplers
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <a key={filter.value} href={`/dashboard/announcements?type=${filter.value}`}>
              <Badge
                variant={typeFilter === filter.value ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-brand/90 flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </Badge>
            </a>
          );
        })}
      </div>

      {announcements.length === 0 ? (
        <NoAnnouncementsCard />
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={{
                ...announcement,
                type: announcement.type as AnnouncementType,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
