/**
 * Failure Signature Types
 * Core types for capturing and categorizing failures
 */

export type FailureCategory =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'database'
  | 'external_api'
  | 'payment'
  | 'email'
  | 'file_upload'
  | 'rate_limit'
  | 'network'
  | 'unknown';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface FailureContext {
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  userId?: string;
  requestBody?: Record<string, unknown>;
  headers?: Record<string, string>;
  environment: 'production' | 'staging' | 'development';
  timestamp: Date;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack: string;
  cause?: unknown;
  code?: string;
}

export interface SystemState {
  memoryUsage: number;
  nodeVersion: string;
  lastDeployment?: Date;
  environmentVariables: string[]; // Keys only, never values
}

export interface Resolution {
  resolvedAt: Date;
  resolvedBy: 'auto' | 'manual';
  action: string;
  patternId?: string;
  success: boolean;
  rollbackExecuted?: boolean;
}

export interface FailureSignature {
  id: string;
  fingerprint: string;
  timestamp: Date;
  
  // Classification
  category: FailureCategory;
  severity: Severity;
  
  // Context
  context: FailureContext;
  
  // Error Details
  error: ErrorDetails;
  
  // System State
  systemState: SystemState;
  
  // Resolution (if resolved)
  resolution?: Resolution;
  
  // Metadata
  occurrenceCount: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface FailureSignatureInput {
  error: Error;
  context: Omit<FailureContext, 'timestamp'>;
  category?: FailureCategory;
  severity?: Severity;
}
