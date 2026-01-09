import { supabaseAdmin } from './supabase';

export interface FeatureModule {
  id: string;
  module_key: string;
  name: string;
  description: string | null;
  category: string;
  is_enabled: boolean;
  disabled_message: string | null;
  disabled_by: string | null;
  disabled_at: string | null;
  icon: string | null;
  sort_order: number;
}

export type FeatureModuleKey =
  | 'revenue_intelligence'
  | 'community_boards'
  | 'video_media'
  | 'notifications'
  | 'enrollments'
  | 'admin_panel'
  | 'my_students'
  | 'locations'
  | 'announcements'
  | 'student_of_month'
  | 'waivers'
  | 'memberships';

export const FEATURE_MODULE_DEFAULTS: Record<FeatureModuleKey, { name: string; category: string }> = {
  revenue_intelligence: { name: 'Revenue Intelligence', category: 'admin' },
  community_boards: { name: 'Community Boards', category: 'community' },
  video_media: { name: 'Video + Images', category: 'content' },
  notifications: { name: 'Notifications', category: 'communication' },
  enrollments: { name: 'Enrollments', category: 'admin' },
  admin_panel: { name: 'Admin Panel', category: 'admin' },
  my_students: { name: 'My Students', category: 'portal' },
  locations: { name: 'Multi-Location', category: 'admin' },
  announcements: { name: 'Announcements', category: 'communication' },
  student_of_month: { name: 'Student of the Month', category: 'content' },
  waivers: { name: 'Waivers', category: 'admin' },
  memberships: { name: 'Memberships', category: 'admin' },
};

let cachedModules: Map<string, FeatureModule> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

export async function getFeatureModules(): Promise<FeatureModule[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('feature_modules')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Failed to fetch feature modules:', error);
      return [];
    }

    // Update cache
    cachedModules = new Map(data.map((m) => [m.module_key, m]));
    cacheTimestamp = Date.now();

    return data;
  } catch (error) {
    console.error('Error fetching feature modules:', error);
    return [];
  }
}

export async function getFeatureModule(moduleKey: FeatureModuleKey): Promise<FeatureModule | null> {
  // Check cache first
  if (cachedModules && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedModules.get(moduleKey) || null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('feature_modules')
      .select('*')
      .eq('module_key', moduleKey)
      .single();

    if (error) {
      console.error(`Failed to fetch feature module ${moduleKey}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching feature module ${moduleKey}:`, error);
    return null;
  }
}

export async function isFeatureEnabled(moduleKey: FeatureModuleKey): Promise<boolean> {
  const module = await getFeatureModule(moduleKey);
  
  // Default to enabled if module doesn't exist (table not created yet)
  if (!module) return true;
  
  return module.is_enabled;
}

export async function getDisabledMessage(moduleKey: FeatureModuleKey): Promise<string | null> {
  const module = await getFeatureModule(moduleKey);
  
  if (!module || module.is_enabled) return null;
  
  return module.disabled_message || 'This feature is currently unavailable.';
}

export async function toggleFeatureModule(
  moduleKey: FeatureModuleKey,
  isEnabled: boolean,
  performedBy: string,
  reason?: string,
  disabledMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('toggle_feature_module', {
      p_module_key: moduleKey,
      p_is_enabled: isEnabled,
      p_performed_by: performedBy,
      p_reason: reason || null,
      p_disabled_message: disabledMessage || null,
    });

    if (error) {
      console.error('Failed to toggle feature module:', error);
      return { success: false, error: error.message };
    }

    // Invalidate cache
    cachedModules = null;

    return { success: true };
  } catch (error) {
    console.error('Error toggling feature module:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getFeatureModuleLogs(limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('feature_module_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch feature module logs:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching feature module logs:', error);
    return [];
  }
}

// Helper to check multiple features at once
export async function checkFeatures(moduleKeys: FeatureModuleKey[]): Promise<Record<FeatureModuleKey, boolean>> {
  const modules = await getFeatureModules();
  const moduleMap = new Map(modules.map((m) => [m.module_key, m.is_enabled]));
  
  const result: Record<string, boolean> = {};
  for (const key of moduleKeys) {
    result[key] = moduleMap.get(key) ?? true; // Default to enabled
  }
  
  return result as Record<FeatureModuleKey, boolean>;
}
