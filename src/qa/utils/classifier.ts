/**
 * Error Classifier
 * Automatically categorizes errors based on patterns
 */

import type { FailureCategory, Severity, ErrorDetails, FailureContext } from '../types';

interface ClassificationRule {
  category: FailureCategory;
  patterns: {
    errorName?: RegExp;
    errorMessage?: RegExp;
    errorCode?: string[];
    route?: RegExp;
  };
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // Authentication
  {
    category: 'authentication',
    patterns: {
      errorName: /auth|unauthenticated|unauthorized/i,
      errorMessage: /sign in|login|session|token|jwt|expired/i,
      errorCode: ['AUTH_ERROR', 'UNAUTHORIZED', '401'],
    },
  },
  // Authorization
  {
    category: 'authorization',
    patterns: {
      errorName: /forbidden|permission/i,
      errorMessage: /permission|access denied|not allowed|forbidden/i,
      errorCode: ['FORBIDDEN', '403'],
    },
  },
  // Validation
  {
    category: 'validation',
    patterns: {
      errorName: /validation|zod|schema/i,
      errorMessage: /invalid|required|must be|expected|format/i,
      errorCode: ['VALIDATION_ERROR', '400'],
    },
  },
  // Database
  {
    category: 'database',
    patterns: {
      errorName: /prisma|postgres|supabase|database/i,
      errorMessage: /database|query|constraint|foreign key|unique|connection/i,
      errorCode: ['P2002', 'P2025', 'P2003', '23505', '23503'],
    },
  },
  // Payment
  {
    category: 'payment',
    patterns: {
      errorName: /stripe|payment/i,
      errorMessage: /payment|card|charge|subscription|invoice|checkout/i,
      route: /\/api\/payments|\/checkout/,
    },
  },
  // Email
  {
    category: 'email',
    patterns: {
      errorName: /resend|email|smtp/i,
      errorMessage: /email|send|deliver|mailbox|recipient/i,
      route: /\/api\/.*email|\/api\/webhooks\/resend/,
    },
  },
  // External API
  {
    category: 'external_api',
    patterns: {
      errorName: /fetch|axios|network/i,
      errorMessage: /fetch|api|request|timeout|ECONNREFUSED|ETIMEDOUT/i,
    },
  },
  // Rate Limit
  {
    category: 'rate_limit',
    patterns: {
      errorMessage: /rate limit|too many requests|throttle/i,
      errorCode: ['RATE_LIMITED', '429'],
    },
  },
  // File Upload
  {
    category: 'file_upload',
    patterns: {
      errorMessage: /upload|file size|file type|storage|bucket/i,
      route: /\/api\/upload|\/api\/media/,
    },
  },
  // Network
  {
    category: 'network',
    patterns: {
      errorName: /network|connection/i,
      errorMessage: /network|offline|connection|ENOTFOUND|ECONNRESET/i,
    },
  },
];

/**
 * Classify an error into a category
 */
export function classifyError(
  error: ErrorDetails,
  context?: Partial<FailureContext>
): FailureCategory {
  for (const rule of CLASSIFICATION_RULES) {
    if (matchesRule(error, context, rule)) {
      return rule.category;
    }
  }
  return 'unknown';
}

function matchesRule(
  error: ErrorDetails,
  context: Partial<FailureContext> | undefined,
  rule: ClassificationRule
): boolean {
  const { patterns } = rule;
  
  // Check error name
  if (patterns.errorName && patterns.errorName.test(error.name)) {
    return true;
  }
  
  // Check error message
  if (patterns.errorMessage && patterns.errorMessage.test(error.message)) {
    return true;
  }
  
  // Check error code
  if (patterns.errorCode && error.code && patterns.errorCode.includes(error.code)) {
    return true;
  }
  
  // Check route
  if (patterns.route && context?.route && patterns.route.test(context.route)) {
    return true;
  }
  
  return false;
}

/**
 * Determine severity based on error characteristics
 */
export function determineSeverity(
  error: ErrorDetails,
  context?: Partial<FailureContext>,
  category?: FailureCategory
): Severity {
  // Critical: Data loss, security, payment failures
  const criticalPatterns = [
    /data loss|corruption|security|breach/i,
    /payment failed|charge failed|subscription.*(cancel|fail)/i,
    /database.*corrupt|integrity/i,
  ];
  
  for (const pattern of criticalPatterns) {
    if (pattern.test(error.message)) {
      return 'critical';
    }
  }
  
  // High: Auth failures, API errors in production
  if (category === 'authentication' || category === 'authorization') {
    return 'high';
  }
  
  if (category === 'payment') {
    return 'high';
  }
  
  if (category === 'database') {
    return 'high';
  }
  
  // Medium: Validation, external API, email
  if (category === 'validation' || category === 'external_api' || category === 'email') {
    return 'medium';
  }
  
  // Low: Rate limits, file uploads, network issues
  if (category === 'rate_limit' || category === 'file_upload' || category === 'network') {
    return 'low';
  }
  
  // Default based on error type
  if (error.name.includes('TypeError') || error.name.includes('ReferenceError')) {
    return 'high';
  }
  
  return 'medium';
}
