/**
 * Autonomous QA System - Main Entry Point
 * 
 * Closed-loop, self-learning QA system that detects anomalies,
 * abstracts patterns, and resolves issues autonomously.
 */

export * from './types';
export * from './engine';
export { RESOLUTION_ACTIONS, getAvailableActions, actionExists } from './registry/actions';

import { captureFailure } from './engine/capture';
import { runValidationMesh, runSingleLayer } from './engine/validation';
import { matchPattern, createPatternFromFailures } from './engine/pattern';
import type { 
  FailureSignatureInput, 
  MeshResult, 
  ValidationLayerId,
  PatternRule,
} from './types';

/**
 * Run the complete autonomous QA pipeline
 */
export async function runAutonomousQA(options?: {
  layer?: ValidationLayerId;
  dryRun?: boolean;
  patternScanOnly?: boolean;
}): Promise<QAReport> {
  const startTime = Date.now();
  
  let meshResult: MeshResult;
  
  // Run validation mesh (single layer or all)
  if (options?.layer) {
    const layerResult = await runSingleLayer(options.layer);
    meshResult = {
      passed: layerResult.status === 'pass',
      confidence: layerResult.status === 'pass' ? 1 : 0.5,
      layerResults: { [options.layer]: layerResult } as MeshResult['layerResults'],
      crossValidation: [],
      totalIssues: layerResult.issues.length,
      criticalIssues: layerResult.issues.filter(i => i.severity === 'critical').length,
      recommendations: [],
      timestamp: new Date(),
    };
  } else {
    meshResult = await runValidationMesh();
  }
  
  // Generate report
  const report: QAReport = {
    timestamp: new Date(),
    duration: Date.now() - startTime,
    meshResult,
    patternsMatched: 0,
    autoResolved: 0,
    newPatterns: 0,
    pendingReview: meshResult.criticalIssues,
    systemConfidence: meshResult.confidence,
    dryRun: options?.dryRun || false,
  };
  
  return report;
}

/**
 * Capture a failure for the knowledge base
 */
export async function recordFailure(input: FailureSignatureInput) {
  return captureFailure(input);
}

/**
 * QA Report interface
 */
export interface QAReport {
  timestamp: Date;
  duration: number;
  meshResult: MeshResult;
  patternsMatched: number;
  autoResolved: number;
  newPatterns: number;
  pendingReview: number;
  systemConfidence: number;
  dryRun: boolean;
}

/**
 * Format QA report as ASCII art
 */
export function formatReport(report: QAReport): string {
  const { meshResult } = report;
  const layers = meshResult.layerResults;
  
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pass': return 'PASS';
      case 'fail': return 'FAIL';
      case 'warn': return 'WARN';
      default: return 'SKIP';
    }
  };
  
  const formatIssueCount = (count: number) => `(${count} issues)`;
  
  return `
╔══════════════════════════════════════════════════════════════╗
║                    AUTONOMOUS QA REPORT                       ║
╠══════════════════════════════════════════════════════════════╣
║ Validation Mesh Status                                        ║
║ ├── Static Layer:      [${formatStatus(layers.static?.status || 'skip').padEnd(4)}] ${formatIssueCount(layers.static?.issues.length || 0).padEnd(12)}             ║
║ ├── Runtime Layer:     [${formatStatus(layers.runtime?.status || 'skip').padEnd(4)}] ${formatIssueCount(layers.runtime?.issues.length || 0).padEnd(12)}             ║
║ ├── State Layer:       [${formatStatus(layers.state?.status || 'skip').padEnd(4)}] ${formatIssueCount(layers.state?.issues.length || 0).padEnd(12)}             ║
║ └── Cross-System:      [${formatStatus(layers.audit?.status || 'skip').padEnd(4)}] ${formatIssueCount(layers.audit?.issues.length || 0).padEnd(12)}             ║
╠══════════════════════════════════════════════════════════════╣
║ Pattern Matches: ${String(report.patternsMatched).padEnd(3)} known patterns detected                   ║
║ Auto-Resolved:   ${String(report.autoResolved).padEnd(3)} issues fixed autonomously                   ║
║ New Patterns:    ${String(report.newPatterns).padEnd(3)} failures codified into rules               ║
║ Pending Review:  ${String(report.pendingReview).padEnd(3)} issues require manual attention            ║
╠══════════════════════════════════════════════════════════════╣
║ System Confidence: ${(report.systemConfidence * 100).toFixed(0).padStart(2)}%                                        ║
║ Duration:          ${String(report.duration).padEnd(5)}ms                                     ║
╚══════════════════════════════════════════════════════════════╝
`;
}
