import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { WaiverSigningForm } from './waiver-signing-form';
import { WaiverSignedView } from './waiver-signed-view';

export default async function DashboardWaiverPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/');
  }

  const userEmail = user.emailAddresses?.[0]?.emailAddress;
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  // Check if user has already signed a waiver
  const { data: existingWaiver } = await supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .single();

  if (existingWaiver) {
    return <WaiverSignedView waiver={existingWaiver} />;
  }

  return (
    <WaiverSigningForm
      clerkUserId={userId}
      userEmail={userEmail || ''}
      userName={userName}
    />
  );
}
