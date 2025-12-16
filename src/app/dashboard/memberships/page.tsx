import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MembershipCard, NoMembershipsCard } from '@/components/dashboard';

// Empty array - real data will come from database
const mockMemberships: Array<{
  id: string;
  status: string;
  monthlyRate: number;
  startDate: Date;
  student: { id: string; firstName: string; lastName: string };
  program: { id: string; name: string; location: { name: string } };
}> = [];

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
