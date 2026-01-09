'use client';

import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { type FeatureModuleKey } from '@/lib/feature-modules';

interface FeatureGateProps {
  children: ReactNode;
  moduleKey: FeatureModuleKey;
  isEnabled: boolean;
  disabledMessage?: string | null;
  fallback?: ReactNode;
  hideCompletely?: boolean;
}

export function FeatureGate({
  children,
  moduleKey,
  isEnabled,
  disabledMessage,
  fallback,
  hideCompletely = false,
}: FeatureGateProps) {
  if (isEnabled) {
    return <>{children}</>;
  }

  if (hideCompletely) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Feature Unavailable
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        {disabledMessage || 'This feature is currently disabled. Please contact support for assistance.'}
      </p>
    </div>
  );
}

interface FeatureGateServerProps {
  children: ReactNode;
  moduleKey: FeatureModuleKey;
  modules: Record<string, { is_enabled: boolean; disabled_message?: string | null }>;
  fallback?: ReactNode;
  hideCompletely?: boolean;
}

export function FeatureGateServer({
  children,
  moduleKey,
  modules,
  fallback,
  hideCompletely = false,
}: FeatureGateServerProps) {
  const module = modules[moduleKey];
  const isEnabled = module?.is_enabled ?? true;
  const disabledMessage = module?.disabled_message;

  if (isEnabled) {
    return <>{children}</>;
  }

  if (hideCompletely) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Feature Unavailable
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        {disabledMessage || 'This feature is currently disabled. Please contact support for assistance.'}
      </p>
    </div>
  );
}
