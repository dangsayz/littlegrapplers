import { supabaseAdmin } from './supabase';
import { type FeatureModule, type FeatureModuleKey } from './feature-modules';

export type FeatureModulesMap = Record<FeatureModuleKey, FeatureModule>;

export async function getFeatureModulesMap(): Promise<FeatureModulesMap> {
  try {
    const { data, error } = await supabaseAdmin
      .from('feature_modules')
      .select('*')
      .order('sort_order');

    if (error || !data) {
      // Return all enabled by default if table doesn't exist
      return {} as FeatureModulesMap;
    }

    return data.reduce((acc, module) => {
      acc[module.module_key as FeatureModuleKey] = module;
      return acc;
    }, {} as FeatureModulesMap);
  } catch {
    return {} as FeatureModulesMap;
  }
}

export function isModuleEnabled(
  modules: FeatureModulesMap,
  key: FeatureModuleKey
): boolean {
  const module = modules[key];
  // Default to enabled if module doesn't exist
  return module?.is_enabled ?? true;
}

export function getModuleMessage(
  modules: FeatureModulesMap,
  key: FeatureModuleKey
): string | null {
  const module = modules[key];
  if (!module || module.is_enabled) return null;
  return module.disabled_message || 'This feature is currently unavailable.';
}
