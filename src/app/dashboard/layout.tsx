import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

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

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === ADMIN_EMAIL;

  // Check onboarding status (skip for admin)
  if (!isAdmin && user) {
    try {
      // Check if user exists in our database
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (dbUser) {
        // Check if parent profile exists and onboarding is complete
        const { data: parent } = await supabaseAdmin
          .from('parents')
          .select('onboarding_completed')
          .eq('user_id', dbUser.id)
          .single();

        if (!parent || !parent.onboarding_completed) {
          redirect('/onboarding');
        }
      } else {
        // User doesn't exist in DB yet - redirect to onboarding
        redirect('/onboarding');
      }
    } catch (error) {
      // If check fails, redirect to onboarding to be safe
      redirect('/onboarding');
    }
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

        {/* Page content - extra bottom padding on mobile for floating nav */}
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Mobile floating bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
