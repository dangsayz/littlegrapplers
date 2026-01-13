/**
 * QA System API Endpoint
 * Triggers the autonomous QA pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runAutonomousQA, formatReport } from '@/qa';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import type { ValidationLayerId } from '@/qa/types';

export async function POST(request: NextRequest) {
  try {
    // Auth check - admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, role')
      .eq('clerk_user_id', userId)
      .single();

    const isAdmin = user?.role === 'admin' || ADMIN_EMAILS.includes(user?.email || '');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse options
    const body = await request.json().catch(() => ({}));
    const options: {
      layer?: ValidationLayerId;
      dryRun?: boolean;
      patternScanOnly?: boolean;
    } = {
      layer: body.layer,
      dryRun: body.dryRun || false,
      patternScanOnly: body.patternScanOnly || false,
    };

    // Run the QA pipeline
    const report = await runAutonomousQA(options);

    // Store the mesh result
    await supabaseAdmin
      .from('qa_mesh_results')
      .insert({
        passed: report.meshResult.passed,
        confidence: report.meshResult.confidence,
        layer_results: report.meshResult.layerResults,
        cross_validation: report.meshResult.crossValidation,
        total_issues: report.meshResult.totalIssues,
        critical_issues: report.meshResult.criticalIssues,
        recommendations: report.meshResult.recommendations,
      });

    // Return formatted report
    return NextResponse.json({
      success: true,
      report,
      formatted: formatReport(report),
    });

  } catch (error) {
    console.error('QA pipeline error:', error);
    return NextResponse.json(
      { error: 'QA pipeline failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return last QA run result
  try {
    const { data } = await supabaseAdmin
      .from('qa_mesh_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      return NextResponse.json({ message: 'No QA runs found' }, { status: 404 });
    }

    return NextResponse.json({
      lastRun: data.created_at,
      passed: data.passed,
      confidence: data.confidence,
      totalIssues: data.total_issues,
      criticalIssues: data.critical_issues,
      recommendations: data.recommendations,
    });

  } catch (error) {
    console.error('QA status error:', error);
    return NextResponse.json(
      { error: 'Failed to get QA status' },
      { status: 500 }
    );
  }
}
