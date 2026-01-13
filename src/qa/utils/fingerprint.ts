/**
 * Fingerprint Generator
 * Creates deterministic hashes for failure deduplication
 */

import { createHash } from 'crypto';
import type { FailureContext, ErrorDetails } from '../types';

/**
 * Generate a deterministic fingerprint for a failure
 * Same error in same context = same fingerprint
 */
export function generateFingerprint(
  error: ErrorDetails,
  context: Partial<FailureContext>
): string {
  const normalizedStack = normalizeStack(error.stack);
  
  const fingerprintData = {
    errorName: error.name,
    errorMessage: normalizeMessage(error.message),
    errorCode: error.code,
    stackSignature: extractStackSignature(normalizedStack),
    route: context.route,
    method: context.method,
  };
  
  const hash = createHash('sha256');
  hash.update(JSON.stringify(fingerprintData));
  return hash.digest('hex').substring(0, 16);
}

/**
 * Normalize stack trace by removing line numbers and file paths
 * This ensures same logical error = same fingerprint
 */
function normalizeStack(stack: string): string {
  if (!stack) return '';
  
  return stack
    .split('\n')
    .map(line => {
      // Remove line numbers: file.ts:123:45 -> file.ts
      return line.replace(/:\d+:\d+/g, '');
    })
    .filter(line => {
      // Remove node_modules frames
      return !line.includes('node_modules');
    })
    .slice(0, 5) // Only first 5 frames matter
    .join('\n');
}

/**
 * Extract function call signature from stack
 */
function extractStackSignature(normalizedStack: string): string {
  const frames = normalizedStack
    .split('\n')
    .filter(line => line.includes('at '))
    .map(line => {
      const match = line.match(/at\s+(\S+)/);
      return match ? match[1] : '';
    })
    .filter(Boolean)
    .slice(0, 3);
  
  return frames.join('->');
}

/**
 * Normalize error message by removing variable parts
 */
function normalizeMessage(message: string): string {
  if (!message) return '';
  
  return message
    // Remove UUIDs
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    // Remove timestamps
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '<TIMESTAMP>')
    // Remove numbers that look like IDs
    .replace(/\b\d{5,}\b/g, '<ID>')
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<EMAIL>')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two fingerprints
 * Returns 0-1 (1 = identical)
 */
export function fingerprintSimilarity(fp1: string, fp2: string): number {
  if (fp1 === fp2) return 1;
  
  // Character-level comparison for partial matches
  let matches = 0;
  const minLen = Math.min(fp1.length, fp2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (fp1[i] === fp2[i]) matches++;
  }
  
  return matches / Math.max(fp1.length, fp2.length);
}
