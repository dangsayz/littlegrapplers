'use client';

import Link from 'next/link';
import { Bell, Trophy, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AnnouncementType = 'general' | 'student_of_month' | 'event' | 'schedule_change';

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    publishAt: Date | string;
    studentOfMonth?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    } | null;
  };
  href?: string;
}

const typeConfig: Record<AnnouncementType, { icon: typeof Bell; label: string; color: string }> = {
  general: { icon: Bell, label: 'General', color: 'bg-blue-100 text-blue-700' },
  student_of_month: { icon: Trophy, label: 'Student of the Month', color: 'bg-yellow-100 text-yellow-700' },
  event: { icon: Calendar, label: 'Event', color: 'bg-green-100 text-green-700' },
  schedule_change: { icon: Clock, label: 'Schedule Change', color: 'bg-orange-100 text-orange-700' },
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AnnouncementCard({ announcement, href }: AnnouncementCardProps) {
  const config = typeConfig[announcement.type] || typeConfig.general;
  const Icon = config.icon;
  const linkHref = href || `/dashboard/announcements/${announcement.id}`;

  return (
    <Link href={linkHref as never}>
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-brand/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(announcement.publishAt)}
                </span>
              </div>
              <h3 className="font-medium text-sm group-hover:text-brand transition-colors line-clamp-1">
                {announcement.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {announcement.content.replace(/<[^>]*>/g, '')}
              </p>
              {announcement.type === 'student_of_month' && announcement.studentOfMonth && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded">
                  <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                    <Trophy className="h-3 w-3 text-brand" />
                  </div>
                  <span className="text-xs font-medium">
                    {announcement.studentOfMonth.firstName} {announcement.studentOfMonth.lastName}
                  </span>
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NoAnnouncementsCard() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium">No announcements</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Check back later for updates from Little Grapplers.
        </p>
      </CardContent>
    </Card>
  );
}
