import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop only */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader
          firstName={user?.firstName}
          lastName={user?.lastName}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
