import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipCard, NoMembershipsCard } from '@/components/dashboard';

// TODO: Replace with actual database query
const mockMemberships = [
  {
    id: '1',
    status: 'active',
    monthlyRate: 9900,
    startDate: new Date('2024-09-15'),
    student: { id: '1', firstName: 'Timmy', lastName: 'Johnson' },
    program: {
      id: '1',
      name: 'Tiny Grapplers (Ages 4-6)',
      location: { name: 'Austin HQ' },
    },
  },
  {
    id: '2',
    status: 'active',
    monthlyRate: 9900,
    startDate: new Date('2024-10-01'),
    student: { id: '2', firstName: 'Sarah', lastName: 'Johnson' },
    program: {
      id: '2',
      name: 'Little Grapplers (Ages 7-10)',
      location: { name: 'Austin HQ' },
    },
  },
];

export default async function MembershipsPage() {
  const memberships = mockMemberships;
  const hasMemberships = memberships.length > 0;

  // Calculate totals
  const totalMonthly = memberships
    .filter((m) => m.status === 'active')
    .reduce((sum, m) => sum + m.monthlyRate, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand" />
            Memberships
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your family&apos;s program enrollments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/memberships/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Membership
          </Link>
        </Button>
      </div>

      {/* Monthly Summary */}
      {hasMemberships && (
        <div className="p-4 rounded-lg bg-brand/5 border border-brand/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Active memberships monthly total
            </span>
            <span className="text-xl font-bold text-brand">
              ${(totalMonthly / 100).toFixed(2)}/mo
            </span>
          </div>
        </div>
      )}

      {/* Memberships List */}
      {hasMemberships ? (
        <div className="space-y-4">
          {memberships.map((membership) => (
            <MembershipCard key={membership.id} membership={membership} />
          ))}
        </div>
      ) : (
        <NoMembershipsCard />
      )}
    </div>
  );
}
