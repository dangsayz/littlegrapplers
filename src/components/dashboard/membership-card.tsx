import Link from 'next/link';
import { FileText, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }
> = {
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'secondary' },
};

interface MembershipCardProps {
  membership: {
    id: string;
    status: string;
    monthlyRate: number;
    startDate: Date | string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
    program: {
      id: string;
      name: string;
      location: {
        name: string;
      };
    };
  };
}

export function MembershipCard({ membership }: MembershipCardProps) {
  const status = statusConfig[membership.status] || statusConfig.pending;
  const monthlyRate = (membership.monthlyRate / 100).toFixed(2);
  const startDate = new Date(membership.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Student name and status */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">
                {membership.student.firstName} {membership.student.lastName}
              </h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {/* Program info */}
            <p className="text-sm text-muted-foreground mt-1">
              {membership.program.name}
            </p>

            {/* Location and date */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {membership.program.location.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Since {startDate}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-brand">${monthlyRate}</div>
            <div className="text-xs text-muted-foreground">/month</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/memberships/${membership.id}`}>
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </Link>
          </Button>
          {membership.status === 'active' && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state when no memberships
export function NoMembershipsCard({ hasStudents = false }: { hasStudents?: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No active memberships</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enroll your child in Little Grapplers to get started.
        </p>
        <Button asChild>
          <Link href="/enroll">Enroll a Child</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
