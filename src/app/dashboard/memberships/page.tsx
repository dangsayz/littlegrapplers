import Link from 'next/link';
import { Plus, FileText, XCircle, PauseCircle, Clock } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MembershipCard, NoMembershipsCard } from '@/components/dashboard';
import { supabaseAdmin } from '@/lib/supabase';

import { getUnifiedMembershipStatus } from '@/lib/membership-sync';

export default async function MembershipsPage() {
  const { userId } = await auth();
  
  // Get unified membership status
  let membershipStatus: any = null;
  let pendingRequests: Array<{
    id: string;
    request_type: string;
    status: string;
    created_at: string;
    reason: string;
  }> = [];

  let hasStudents = false;

  if (userId) {
    membershipStatus = await getUnifiedMembershipStatus(userId);
    
    const { data: requests } = await supabaseAdmin
      .from('membership_requests')
      .select('id, request_type, status, created_at, reason')
      .eq('clerk_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (requests) {
      pendingRequests = requests;
    }

    // Check if user has any students
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (dbUser) {
      const { data: parent } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', dbUser.id)
        .single();

      if (parent) {
        const { count } = await supabaseAdmin
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('parent_id', parent.id);
        
        hasStudents = (count ?? 0) > 0;
      }
    }
  }

  // Transform to membership format for display
  // Show membership if user has subscription OR has an enrollment (even if pending payment)
  const hasMembershipRecord = membershipStatus?.hasSubscription || membershipStatus?.hasEnrollment;
  
  const memberships = hasMembershipRecord ? [{
    id: membershipStatus.subscription?.id || membershipStatus.enrollment?.id || 'unified',
    status: membershipStatus.unifiedStatus,
    monthlyRate: 0, // Will be updated when we have pricing
    startDate: membershipStatus.subscription?.current_period_start 
      ? new Date(membershipStatus.subscription.current_period_start) 
      : membershipStatus.enrollment?.submitted_at 
        ? new Date(membershipStatus.enrollment.submitted_at)
        : new Date(),
    student: { id: '', firstName: '', lastName: '' },
    program: { id: '', name: membershipStatus.subscription?.plan_name || 'Enrollment', location: { name: '' } },
  }] : [];

  const hasMemberships = hasMembershipRecord;
  const hasActiveSubscription = membershipStatus?.unifiedStatus === 'active';
  const isPendingPayment = membershipStatus?.unifiedStatus === 'pending_payment';

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
          <Link href="/enroll">
            <Plus className="h-4 w-4 mr-2" />
            Enroll a Child
          </Link>
        </Button>
      </div>

      {/* Pending Payment Banner */}
      {isPendingPayment && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">Payment Required</p>
              <p className="text-sm text-amber-600">
                Your enrollment has been approved. Please complete payment to activate your membership.
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/dashboard/checkout">Complete Payment</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {hasActiveSubscription && (
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
          
          {/* Easy add another child */}
          <Card className="border-dashed border-brand/30 hover:border-brand/60 transition-colors">
            <CardContent className="p-6">
              <Link href="/enroll" className="flex items-center justify-center gap-3 text-brand hover:text-brand/80">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Enroll Another Child</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <NoMembershipsCard hasStudents={hasStudents} />
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    {request.request_type === 'cancel' ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <PauseCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {request.request_type.replace('_', ' ')} Request
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                    Pending Review
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Actions */}
      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manage Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/memberships/request?type=pause"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <PauseCircle className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium">Pause Membership</p>
                  <p className="text-sm text-muted-foreground">
                    Take a temporary break
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/memberships/request?type=cancel"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
              >
                <XCircle className="h-6 w-6 text-destructive" />
                <div>
                  <p className="font-medium">Cancel Membership</p>
                  <p className="text-sm text-muted-foreground">
                    End your membership
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
