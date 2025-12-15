import Link from 'next/link';
import { Plus, Users, FileText, ArrowRight } from 'lucide-react';
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
} from '@/components/dashboard';

// TODO: Replace with actual database queries
// These are mock data for development - will be replaced with Prisma queries
const mockStudents = [
  {
    id: '1',
    firstName: 'Timmy',
    lastName: 'Johnson',
    beltRank: 'yellow',
    stripes: 2,
    avatarUrl: null,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    beltRank: 'white',
    stripes: 4,
    avatarUrl: null,
  },
];

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

const mockThreads = [
  {
    id: '1',
    title: 'Holiday Schedule Update - December Classes',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isPinned: true,
    replyCount: 5,
    author: { firstName: 'Coach Mike' },
    program: { name: 'Tiny Grapplers', location: { name: 'Austin HQ' } },
  },
  {
    id: '2',
    title: 'Tips for practicing at home',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isPinned: false,
    replyCount: 12,
    author: { firstName: 'Jessica' },
    program: { name: 'Little Grapplers', location: { name: 'Austin HQ' } },
  },
  {
    id: '3',
    title: 'Tournament next month - sign up now!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isPinned: false,
    replyCount: 8,
    author: { firstName: 'Coach Sarah' },
    program: { name: 'All Programs', location: { name: 'Austin HQ' } },
  },
];

const mockParentAddress = {
  address: '123 Main Street',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
};

export default async function DashboardPage() {
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
