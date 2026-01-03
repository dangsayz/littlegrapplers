import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { MASTER_EMAILS } from '@/lib/site-status';

// GET current freeze status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!userId || !email || !MASTER_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      frozen: process.env.SITE_FROZEN === 'true',
      message: process.env.SITE_FREEZE_MESSAGE || 'Site is under maintenance.',
    });
  } catch (error) {
    console.error('Site freeze status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Note: To actually freeze the site, you need to set these env vars in Vercel:
// SITE_FROZEN=true
// SITE_FREEZE_MESSAGE="Your custom message here"
//
// This is intentional - freezing requires Vercel dashboard access,
// which only the developers have. This prevents accidental freezes.
