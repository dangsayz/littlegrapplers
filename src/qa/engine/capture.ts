/**
 * Failure Capture Engine
 * Captures, fingerprints, and stores failure signatures
 */

import { supabaseAdmin } from '@/lib/supabase';
import { generateFingerprint } from '../utils/fingerprint';
import { classifyError, determineSeverity } from '../utils/classifier';
import type { 
  FailureSignature, 
  FailureSignatureInput, 
  FailureContext,
  ErrorDetails,
  SystemState 
} from '../types';
import { matchPattern, executeResolution } from './pattern';

/**
 * Capture a failure and store it in the knowledge base
 */
export async function captureFailure(
  input: FailureSignatureInput
): Promise<FailureSignature> {
  const timestamp = new Date();
  
  // Build error details
  const errorDetails: ErrorDetails = {
    name: input.error.name,
    message: input.error.message,
    stack: input.error.stack || '',
    cause: input.error.cause,
    code: (input.error as Error & { code?: string }).code,
  };
  
  // Build context with timestamp
  const context: FailureContext = {
    ...input.context,
    timestamp,
  };
  
  // Generate fingerprint
  const fingerprint = generateFingerprint(errorDetails, context);
  
  // Classify error
  const category = input.category || classifyError(errorDetails, context);
  const severity = input.severity || determineSeverity(errorDetails, context, category);
  
  // Capture system state
  const systemState = captureSystemState();
  
  // Build signature
  const signature: FailureSignature = {
    id: crypto.randomUUID(),
    fingerprint,
    timestamp,
    category,
    severity,
    context,
    error: errorDetails,
    systemState,
    occurrenceCount: 1,
    firstSeen: timestamp,
    lastSeen: timestamp,
  };
  
  // Check for existing fingerprint
  const existingFailure = await findByFingerprint(fingerprint);
  
  if (existingFailure) {
    // Update occurrence count
    signature.occurrenceCount = existingFailure.occurrenceCount + 1;
    signature.firstSeen = new Date(existingFailure.firstSeen);
    await updateOccurrence(fingerprint);
  }
  
  // Try to match against known patterns
  const patternMatch = await matchPattern(signature);
  
  if (patternMatch && patternMatch.confidence >= 0.8) {
    // Auto-resolve with known pattern
    const resolution = await executeResolution(patternMatch.pattern, signature);
    signature.resolution = {
      resolvedAt: new Date(),
      resolvedBy: 'auto',
      action: patternMatch.pattern.resolution.action,
      patternId: patternMatch.pattern.id,
      success: resolution.success,
    };
  }
  
  // Persist to knowledge base
  await persistFailure(signature);
  
  return signature;
}

/**
 * Capture current system state
 */
function captureSystemState(): SystemState {
  const memoryUsage = process.memoryUsage();
  
  return {
    memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
    nodeVersion: process.version,
    environmentVariables: Object.keys(process.env).filter(key => 
      !key.includes('SECRET') && 
      !key.includes('KEY') && 
      !key.includes('PASSWORD')
    ),
  };
}

/**
 * Find existing failure by fingerprint
 */
async function findByFingerprint(fingerprint: string): Promise<{
  occurrenceCount: number;
  firstSeen: string;
} | null> {
  const { data } = await supabaseAdmin
    .from('qa_failures')
    .select('id, occurrence_count, first_seen, created_at')
    .eq('fingerprint', fingerprint)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (data) {
    return {
      occurrenceCount: (data as Record<string, unknown>).occurrence_count as number || 1,
      firstSeen: ((data as Record<string, unknown>).first_seen || (data as Record<string, unknown>).created_at) as string,
    };
  }
  
  return null;
}

/**
 * Update occurrence count for existing fingerprint
 */
async function updateOccurrence(fingerprint: string): Promise<void> {
  await supabaseAdmin
    .from('qa_failures')
    .update({
      occurrence_count: supabaseAdmin.rpc('increment_occurrence', { fp: fingerprint }),
      last_seen: new Date().toISOString(),
    })
    .eq('fingerprint', fingerprint);
}

/**
 * Persist failure to database
 */
async function persistFailure(signature: FailureSignature): Promise<void> {
  const { error } = await supabaseAdmin
    .from('qa_failures')
    .insert({
      id: signature.id,
      fingerprint: signature.fingerprint,
      category: signature.category,
      severity: signature.severity,
      context: signature.context,
      error: signature.error,
      system_state: signature.systemState,
      resolution: signature.resolution || null,
      occurrence_count: signature.occurrenceCount,
      first_seen: signature.firstSeen.toISOString(),
      last_seen: signature.lastSeen.toISOString(),
    });
  
  if (error) {
    console.error('[QA] Failed to persist failure:', error);
  }
}

/**
 * Find similar failures for pattern learning
 */
export async function findSimilarFailures(
  signature: FailureSignature,
  options: { timeWindow: string; minSimilarity: number }
): Promise<FailureSignature[]> {
  const { data } = await supabaseAdmin
    .from('qa_failures')
    .select('*')
    .eq('category', signature.category)
    .gte('created_at', getTimeWindowDate(options.timeWindow).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (!data) return [];
  
  // Convert to FailureSignature and filter by similarity
  return data
    .map(row => rowToSignature(row))
    .filter(s => s.fingerprint !== signature.fingerprint);
}

function getTimeWindowDate(window: string): Date {
  const now = new Date();
  const match = window.match(/(\d+)([dhm])/);
  
  if (!match) return now;
  
  const [, value, unit] = match;
  const ms = parseInt(value) * (
    unit === 'd' ? 86400000 :
    unit === 'h' ? 3600000 :
    unit === 'm' ? 60000 : 0
  );
  
  return new Date(now.getTime() - ms);
}

function rowToSignature(row: Record<string, unknown>): FailureSignature {
  return {
    id: row.id as string,
    fingerprint: row.fingerprint as string,
    timestamp: new Date(row.created_at as string),
    category: row.category as FailureSignature['category'],
    severity: row.severity as FailureSignature['severity'],
    context: row.context as FailureSignature['context'],
    error: row.error as FailureSignature['error'],
    systemState: row.system_state as FailureSignature['systemState'],
    resolution: row.resolution as FailureSignature['resolution'],
    occurrenceCount: row.occurrence_count as number,
    firstSeen: new Date(row.first_seen as string),
    lastSeen: new Date(row.last_seen as string),
  };
}
