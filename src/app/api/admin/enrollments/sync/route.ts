import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { runEnrollmentHealthCheck } from '@/lib/enrollment-monitor';

export async function POST(request: NextRequest) {
  try {
    // Run comprehensive health check that includes orphaned waiver handling
    const healthResult = await runEnrollmentHealthCheck();
    
    return NextResponse.json({
      synced: healthResult.totalChecked,
      fixed: healthResult.issuesFixed,
      errors: healthResult.errors,
    });
  } catch (error) {
    console.error('Enrollment sync error:', error);
    return NextResponse.json(
      { 
        synced: 0, 
        fixed: 0, 
        errors: ['Internal server error'] 
      }, 
      { status: 500 }
    );
  }
}
