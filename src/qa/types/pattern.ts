/**
 * Pattern Rule Types
 * Types for codified failure patterns and their resolutions
 */

import type { FailureCategory, Severity } from './failure';

export type MatchOperator = 'equals' | 'contains' | 'matches' | 'in' | 'gt' | 'lt';

export interface MatchCondition {
  field: string; // Dot notation for nested fields (e.g., 'error.name')
  operator: MatchOperator;
  value: unknown;
}

export type ResolutionType = 
  | 'code_fix'
  | 'config_change'
  | 'restart'
  | 'notify'
  | 'circuit_break'
  | 'retry'
  | 'rollback'
  | 'escalate';

export interface ResolutionAction {
  type: ResolutionType;
  action: string;
  script?: string;
  rollbackScript?: string;
  requiresApproval: boolean;
  timeout: number; // ms
}

export interface PatternRule {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Matching
  fingerprints: string[];
  matchConditions: MatchCondition[];
  category: FailureCategory;
  minSeverity: Severity;
  
  // Resolution
  resolution: ResolutionAction;
  
  // Metrics
  occurrences: number;
  lastOccurrence: Date | null;
  successCount: number;
  failureCount: number;
  
  // Learning
  confidence: number; // 0-1
  manualOverrides: number;
  enabled: boolean;
}

export interface PatternMatch {
  pattern: PatternRule;
  confidence: number;
  matchedConditions: string[];
  fingerprintMatch: boolean;
}

export interface PatternRuleInput {
  name: string;
  description: string;
  matchConditions: MatchCondition[];
  category: FailureCategory;
  minSeverity: Severity;
  resolution: ResolutionAction;
}
