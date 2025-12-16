import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CheckoutClient } from './checkout-client';

export default async function CheckoutPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const userId = user.id;
  const userEmail = user.emailAddresses[0]?.emailAddress || '';
  const userName = user.firstName || user.fullName || 'User';

  // Check if user has signed waiver
  const { data: waiver } = await supabaseAdmin
    .from('signed_waivers')
    .select('id, child_full_name, location_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!waiver) {
    // Redirect to waiver if not signed
    redirect('/dashboard/waiver');
  }

  // Check if user already has an active subscription
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('clerk_user_id', userId)
    .in('status', ['active', 'pending'])
    .single();

  if (subscription?.status === 'active') {
    // Already subscribed, redirect to dashboard
    redirect('/dashboard');
  }

  // Get location name if available
  let locationName = null;
  if (waiver.location_id) {
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('name')
      .eq('id', waiver.location_id)
      .single();
    locationName = location?.name;
  }

  return (
    <CheckoutClient
      clerkUserId={userId}
      userEmail={userEmail}
      userName={userName}
      childName={waiver.child_full_name}
      locationName={locationName}
      waiverId={waiver.id}
    />
  );
}
