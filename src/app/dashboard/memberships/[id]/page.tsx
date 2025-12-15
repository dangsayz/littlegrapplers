import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, MapPin, CreditCard, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'secondary' },
};

// TODO: Replace with actual database query
const mockMembership = {
  id: '1',
  status: 'active',
  monthlyRate: 9900,
  startDate: new Date('2024-09-15'),
  contractSignedAt: new Date('2024-09-14'),
  student: {
    id: '1',
    firstName: 'Timmy',
    lastName: 'Johnson',
  },
  program: {
    id: '1',
    name: 'Tiny Grapplers (Ages 4-6)',
    schedule: [
      { day: 'Monday', startTime: '4:00 PM', endTime: '5:00 PM' },
      { day: 'Wednesday', startTime: '4:00 PM', endTime: '5:00 PM' },
    ],
    location: {
      name: 'Austin HQ',
      address: '123 Training Way',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
  },
};

interface MembershipPageProps {
  params: Promise<{ id: string }>;
}

export default async function MembershipPage({ params }: MembershipPageProps) {
  const { id } = await params;
  // TODO: Fetch actual membership by id
  const membership = mockMembership;
  const status = statusConfig[membership.status] || statusConfig.pending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/memberships" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Memberships
        </Link>
      </Button>

      {/* Membership Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-display font-bold">
                  {membership.program.name}
                </h1>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  {membership.student.firstName} {membership.student.lastName}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand">
                ${(membership.monthlyRate / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {membership.program.schedule.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="font-medium">{slot.day}</span>
                  <span className="text-muted-foreground">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{membership.program.location.name}</p>
            <p className="text-muted-foreground mt-1">
              {membership.program.location.address}
              <br />
              {membership.program.location.city}, {membership.program.location.state}{' '}
              {membership.program.location.zip}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contract & Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            Membership Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {membership.startDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Signed</p>
              <p className="font-medium">
                {membership.contractSignedAt?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) || 'Not signed'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            {membership.status === 'active' && (
              <>
                <Button variant="outline">Pause Membership</Button>
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  Cancel Membership
                </Button>
              </>
            )}
            {membership.status === 'paused' && (
              <Button>Resume Membership</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
