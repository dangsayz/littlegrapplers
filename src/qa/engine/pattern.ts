/**
 * Pattern Matching Engine
 * Matches failures against known patterns and executes resolutions
 */

import { supabaseAdmin } from '@/lib/supabase';
import { fingerprintSimilarity } from '../utils/fingerprint';
import type { 
  FailureSignature,
  PatternRule,
  PatternMatch,
  MatchCondition,
  ResolutionAction,
} from '../types';
import { RESOLUTION_ACTIONS } from '../registry/actions';

/**
 * Match a failure signature against known patterns
 */
export async function matchPattern(
  signature: FailureSignature
): Promise<PatternMatch | null> {
  // Get all enabled patterns for this category
  const patterns = await getPatternsByCategory(signature.category);
  
  if (!patterns.length) return null;
  
  let bestMatch: PatternMatch | null = null;
  let highestConfidence = 0;
  
  for (const pattern of patterns) {
    const match = evaluatePattern(pattern, signature);
    
    if (match && match.confidence > highestConfidence) {
      highestConfidence = match.confidence;
      bestMatch = match;
    }
  }
  
  return bestMatch;
}

/**
 * Evaluate a single pattern against a signature
 */
function evaluatePattern(
  pattern: PatternRule,
  signature: FailureSignature
): PatternMatch | null {
  let confidence = 0;
  const matchedConditions: string[] = [];
  let fingerprintMatch = false;
  
  // Check fingerprint match (highest weight)
  if (pattern.fingerprints.includes(signature.fingerprint)) {
    confidence += 0.5;
    fingerprintMatch = true;
    matchedConditions.push('fingerprint:exact');
  } else {
    // Check fingerprint similarity
    for (const fp of pattern.fingerprints) {
      const similarity = fingerprintSimilarity(fp, signature.fingerprint);
      if (similarity > 0.8) {
        confidence += 0.3 * similarity;
        matchedConditions.push(`fingerprint:similar(${Math.round(similarity * 100)}%)`);
        break;
      }
    }
  }
  
  // Check match conditions
  const conditionScore = evaluateConditions(pattern.matchConditions, signature);
  confidence += conditionScore.score * 0.4;
  matchedConditions.push(...conditionScore.matched);
  
  // Factor in pattern's historical confidence
  confidence *= pattern.confidence;
  
  // Minimum threshold
  if (confidence < 0.5) return null;
  
  return {
    pattern,
    confidence: Math.min(confidence, 1),
    matchedConditions,
    fingerprintMatch,
  };
}

/**
 * Evaluate match conditions against signature
 */
function evaluateConditions(
  conditions: MatchCondition[],
  signature: FailureSignature
): { score: number; matched: string[] } {
  if (!conditions.length) return { score: 0, matched: [] };
  
  const matched: string[] = [];
  let matchCount = 0;
  
  for (const condition of conditions) {
    const value = getNestedValue(signature, condition.field);
    
    if (evaluateCondition(condition, value)) {
      matchCount++;
      matched.push(`${condition.field}:${condition.operator}`);
    }
  }
  
  return {
    score: matchCount / conditions.length,
    matched,
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const record = obj as Record<string, unknown>;
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in (current as object)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, record as unknown);
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: MatchCondition, value: unknown): boolean {
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
      
    case 'contains':
      return typeof value === 'string' && 
             typeof condition.value === 'string' &&
             value.includes(condition.value);
      
    case 'matches':
      return typeof value === 'string' &&
             typeof condition.value === 'string' &&
             new RegExp(condition.value).test(value);
      
    case 'in':
      return Array.isArray(condition.value) && 
             condition.value.includes(value);
      
    case 'gt':
      return typeof value === 'number' &&
             typeof condition.value === 'number' &&
             value > condition.value;
      
    case 'lt':
      return typeof value === 'number' &&
             typeof condition.value === 'number' &&
             value < condition.value;
      
    default:
      return false;
  }
}

/**
 * Execute a resolution action
 */
export async function executeResolution(
  pattern: PatternRule,
  signature: FailureSignature
): Promise<{ success: boolean; error?: Error }> {
  const resolution = pattern.resolution;
  const startTime = Date.now();
  
  try {
    // Check if approval required
    if (resolution.requiresApproval) {
      console.log('[QA] Resolution requires approval, skipping auto-execute');
      return { success: false };
    }
    
    // Execute the action
    const actionFn = RESOLUTION_ACTIONS[resolution.action];
    
    if (actionFn) {
      await Promise.race([
        actionFn(signature),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Resolution timeout')), resolution.timeout)
        ),
      ]);
    } else {
      console.log(`[QA] No action handler for: ${resolution.action}`);
    }
    
    // Log success
    await logResolution(signature.id, pattern.id, resolution.action, true, Date.now() - startTime);
    
    // Update pattern success count
    await updatePatternSuccess(pattern.id, true);
    
    return { success: true };
    
  } catch (error) {
    console.error('[QA] Resolution failed:', error);
    
    // Attempt rollback if available
    if (resolution.rollbackScript) {
      try {
        const rollbackFn = RESOLUTION_ACTIONS[resolution.rollbackScript];
        if (rollbackFn) await rollbackFn(signature);
      } catch (rollbackError) {
        console.error('[QA] Rollback failed:', rollbackError);
      }
    }
    
    // Log failure
    await logResolution(signature.id, pattern.id, resolution.action, false, Date.now() - startTime, error);
    
    // Update pattern failure count
    await updatePatternSuccess(pattern.id, false);
    
    return { success: false, error: error as Error };
  }
}

/**
 * Get patterns by category
 */
async function getPatternsByCategory(category: string): Promise<PatternRule[]> {
  const { data } = await supabaseAdmin
    .from('qa_patterns')
    .select('*')
    .eq('category', category)
    .eq('enabled', true)
    .order('confidence', { ascending: false });
  
  if (!data) return [];
  
  return data.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    fingerprints: row.fingerprints || [],
    matchConditions: row.match_conditions || [],
    category: row.category,
    minSeverity: row.min_severity,
    resolution: row.resolution,
    occurrences: row.occurrences,
    lastOccurrence: row.last_occurrence ? new Date(row.last_occurrence) : null,
    successCount: row.success_count || 0,
    failureCount: row.failure_count || 0,
    confidence: row.confidence,
    manualOverrides: row.manual_overrides || 0,
    enabled: row.enabled,
  }));
}

/**
 * Log resolution attempt
 */
async function logResolution(
  failureId: string,
  patternId: string,
  action: string,
  success: boolean,
  duration: number,
  error?: unknown
): Promise<void> {
  await supabaseAdmin
    .from('qa_resolutions')
    .insert({
      failure_id: failureId,
      pattern_id: patternId,
      action,
      success,
      duration_ms: duration,
      error: error ? { message: (error as Error).message } : null,
      created_at: new Date().toISOString(),
    });
}

/**
 * Update pattern success/failure count
 */
async function updatePatternSuccess(patternId: string, success: boolean): Promise<void> {
  const field = success ? 'success_count' : 'failure_count';
  
  const { data: pattern } = await supabaseAdmin
    .from('qa_patterns')
    .select('success_count, failure_count')
    .eq('id', patternId)
    .single();
  
  if (!pattern) return;
  
  const successCount = pattern.success_count + (success ? 1 : 0);
  const failureCount = pattern.failure_count + (success ? 0 : 1);
  const total = successCount + failureCount;
  
  // Recalculate confidence
  const newConfidence = total > 0 ? successCount / total : 0.5;
  
  await supabaseAdmin
    .from('qa_patterns')
    .update({
      [field]: pattern[field] + 1,
      confidence: newConfidence,
      last_occurrence: new Date().toISOString(),
      occurrences: supabaseAdmin.rpc('increment', { x: 1 }),
    })
    .eq('id', patternId);
}

/**
 * Create a new pattern from recurring failures
 */
export async function createPatternFromFailures(
  failures: FailureSignature[],
  resolution: ResolutionAction
): Promise<PatternRule | null> {
  if (failures.length < 3) return null;
  
  // Extract common characteristics
  const fingerprints = [...new Set(failures.map(f => f.fingerprint))];
  const category = failures[0].category;
  
  // Build match conditions from common traits
  const matchConditions: MatchCondition[] = [];
  
  // Check for common error name
  const errorNames = [...new Set(failures.map(f => f.error.name))];
  if (errorNames.length === 1) {
    matchConditions.push({
      field: 'error.name',
      operator: 'equals',
      value: errorNames[0],
    });
  }
  
  // Check for common route
  const routes = [...new Set(failures.map(f => f.context.route))];
  if (routes.length === 1) {
    matchConditions.push({
      field: 'context.route',
      operator: 'equals',
      value: routes[0],
    });
  }
  
  const patternId = crypto.randomUUID();
  const now = new Date();
  
  const pattern: PatternRule = {
    id: patternId,
    name: `Auto-generated: ${category} pattern`,
    description: `Created from ${failures.length} similar failures`,
    createdAt: now,
    updatedAt: now,
    fingerprints,
    matchConditions,
    category,
    minSeverity: 'medium',
    resolution,
    occurrences: failures.length,
    lastOccurrence: failures[0].timestamp,
    successCount: 0,
    failureCount: 0,
    confidence: 0.5, // Start at 50%
    manualOverrides: 0,
    enabled: false, // Require manual enablement for new patterns
  };
  
  // Persist pattern
  await supabaseAdmin
    .from('qa_patterns')
    .insert({
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      fingerprints: pattern.fingerprints,
      match_conditions: pattern.matchConditions,
      category: pattern.category,
      min_severity: pattern.minSeverity,
      resolution: pattern.resolution,
      occurrences: pattern.occurrences,
      confidence: pattern.confidence,
      enabled: pattern.enabled,
    });
  
  return pattern;
}
