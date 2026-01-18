import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { syncEnrollmentStatusWithSubscription } from '@/lib/membership-sync';

export async function POST() {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Perform the sync
    const result = await syncEnrollmentStatusWithSubscription();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      });
    } else {
      return NextResponse.json({ 
        error: 'Sync failed', 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
