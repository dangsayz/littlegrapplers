/**
 * Validation Mesh Types
 * Types for the multi-layer validation system
 */

export type ValidationLayerId = 'static' | 'runtime' | 'state' | 'audit';

export type ValidationStatus = 'pass' | 'fail' | 'warn' | 'skip';

export interface ValidationIssue {
  id: string;
  layerId: ValidationLayerId;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
  autoFixAvailable: boolean;
}

export interface ValidationResult {
  layerId: ValidationLayerId;
  status: ValidationStatus;
  issues: ValidationIssue[];
  duration: number; // ms
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ValidationLayer {
  id: ValidationLayerId;
  name: string;
  description: string;
  validates: string[];
  validate: () => Promise<ValidationResult>;
}

export interface CrossValidation {
  layer1: ValidationLayerId;
  layer2: ValidationLayerId;
  agreement: boolean;
  conflicts: string[];
}

export interface MeshResult {
  passed: boolean;
  confidence: number;
  layerResults: Record<ValidationLayerId, ValidationResult>;
  crossValidation: CrossValidation[];
  totalIssues: number;
  criticalIssues: number;
  recommendations: string[];
  timestamp: Date;
}

export interface InvariantCheck {
  id: string;
  name: string;
  description: string;
  check: () => Promise<InvariantResult>;
  frequency: 'continuous' | 'hourly' | 'daily';
  enabled: boolean;
}

export interface InvariantResult {
  passed: boolean;
  data?: Record<string, unknown>;
  message?: string;
}
