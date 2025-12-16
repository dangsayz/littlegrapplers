import Link from 'next/link';
import { Plus, Users, FileText, ArrowRight } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  StudentCard,
  NoStudentsCard,
  MembershipCard,
  NoMembershipsCard,
  DiscussionPreview,
  NoDiscussionsAccess,
  BillingPlaceholder,
  WaiverStatusCard,
} from '@/components/dashboard';
import { supabaseAdmin } from '@/lib/supabase';

// Empty arrays - real data will come from database
const mockStudents: Array<{
  id: string;
  firstName: string;
  lastName: string;
  beltRank: string;
  stripes: number;
  avatarUrl: string | null;
}> = [];

const mockMemberships: Array<{
  id: string;
  status: string;
  monthlyRate: number;
  startDate: Date;
  student: { id: string; firstName: string; lastName: string };
  program: { id: string; name: string; location: { name: string } };
}> = [];

// Real threads will be fetched from the database
const mockThreads: Array<{
  id: string;
  title: string;
  createdAt: Date;
  isPinned: boolean;
  replyCount: number;
  author: { firstName: string };
  program: { name: string; location: { name: string } };
}> = [];

const mockParentAddress = {
  address: '',
  city: '',
  state: '',
  zip: '',
};

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // Fetch waiver status
  let waiverStatus = { hasSigned: false, signedAt: null as string | null, childName: null as string | null };
  if (userId) {
    const { data: waiver } = await supabaseAdmin
      .from('signed_waivers')
      .select('signed_at, child_full_name')
      .eq('clerk_user_id', userId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();
    
    if (waiver) {
      waiverStatus = {
        hasSigned: true,
        signedAt: waiver.signed_at,
        childName: waiver.child_full_name,
      };
    }
  }

  // TODO: Fetch real data from database
  const students = mockStudents;
  const memberships = mockMemberships;
  const threads = mockThreads;
  const parentAddress = mockParentAddress;
  const hasStudents = students.length > 0;
  const hasMemberships = memberships.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your students, memberships, and account
        </p>
      </div>

      {/* Waiver Status - Show prominently if not signed */}
      {!waiverStatus.hasSigned && (
        <WaiverStatusCard
          hasSigned={waiverStatus.hasSigned}
          signedAt={waiverStatus.signedAt}
          childName={waiverStatus.childName}
        />
      )}

      {/* Two Column Layout on Desktop */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Students & Memberships */}
        <div className="lg:col-span-2 space-y-6">
          {/* Students Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" />
                My Students
              </CardTitle>
              <Button size="sm" asChild>
                <Link href="/dashboard/students/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Student
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {hasStudents ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {students.slice(0, 4).map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              ) : (
                <NoStudentsCard />
              )}
              {students.length > 4 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/students">
                      View all {students.length} students
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memberships Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                Memberships
              </CardTitle>
              {hasStudents && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/memberships/new">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Membership
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {hasMemberships ? (
                <div className="space-y-4">
                  {memberships.slice(0, 3).map((membership) => (
                    <MembershipCard key={membership.id} membership={membership} />
                  ))}
                </div>
              ) : (
                <NoMembershipsCard />
              )}
              {memberships.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/memberships">
                      View all {memberships.length} memberships
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Discussions & Billing */}
        <div className="space-y-6">
          {/* Discussions */}
          {hasMemberships ? (
            <DiscussionPreview threads={threads} locationName="Austin HQ" />
          ) : (
            <NoDiscussionsAccess />
          )}

          {/* Billing */}
          <BillingPlaceholder
            parentAddress={parentAddress}
            hasStripeCustomer={false}
          />
        </div>
      </div>
    </div>
  );
}
