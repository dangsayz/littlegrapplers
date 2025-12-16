import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bell, Trophy, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import prisma from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

type AnnouncementType = 'general' | 'student_of_month' | 'event' | 'schedule_change';

const typeConfig: Record<AnnouncementType, { icon: typeof Bell; label: string; color: string }> = {
  general: { icon: Bell, label: 'General', color: 'bg-blue-100 text-blue-700' },
  student_of_month: { icon: Trophy, label: 'Student of the Month', color: 'bg-yellow-100 text-yellow-700' },
  event: { icon: Calendar, label: 'Event', color: 'bg-green-100 text-green-700' },
  schedule_change: { icon: Clock, label: 'Schedule Change', color: 'bg-orange-100 text-orange-700' },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

async function getAnnouncement(id: string) {
  return prisma.announcement.findUnique({
    where: { id },
    include: {
      studentOfMonth: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          beltRank: true,
        },
      },
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

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  const config = typeConfig[announcement.type as AnnouncementType] || typeConfig.general;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/dashboard/announcements" as never}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Announcements
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-lg ${config.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{config.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(announcement.publishAt)}
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold">{announcement.title}</h1>
            </div>
          </div>

          {announcement.type === 'student_of_month' && announcement.studentOfMonth && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg mb-6 border border-yellow-200">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                {announcement.studentOfMonth.avatarUrl ? (
                  <img
                    src={announcement.studentOfMonth.avatarUrl}
                    alt={`${announcement.studentOfMonth.firstName} ${announcement.studentOfMonth.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Trophy className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">Student of the Month</p>
                <p className="text-xl font-bold text-yellow-900">
                  {announcement.studentOfMonth.firstName} {announcement.studentOfMonth.lastName}
                </p>
                <p className="text-sm text-yellow-600 capitalize">
                  {announcement.studentOfMonth.beltRank?.replace('_', ' ')} Belt
                </p>
              </div>
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
          </div>

          {announcement.programs.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">Programs:</p>
              <div className="flex flex-wrap gap-2">
                {announcement.programs.map((ap) => (
                  <Badge key={ap.program.id} variant="outline">
                    {ap.program.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
