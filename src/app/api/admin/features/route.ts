import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUserAdminRole, isSuperAdmin } from '@/lib/admin-roles';
import { type FeatureModuleKey, toggleFeatureModule } from '@/lib/feature-modules';

export async function GET() {
  try {
    const { data: modules, error } = await supabaseAdmin
      .from('feature_modules')
      .select('*')
      .order('sort_order');

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json([]);
      }
      console.error('Failed to fetch feature modules:', error);
      return NextResponse.json({ error: 'Failed to fetch feature modules' }, { status: 500 });
    }

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Feature modules GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await getCurrentUserAdminRole();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { module_key, is_enabled, reason, disabled_message } = body;

    if (!module_key) {
      return NextResponse.json({ error: 'module_key is required' }, { status: 400 });
    }

    if (typeof is_enabled !== 'boolean') {
      return NextResponse.json({ error: 'is_enabled must be a boolean' }, { status: 400 });
    }

    const result = await toggleFeatureModule(
      module_key as FeatureModuleKey,
      is_enabled,
      email!,
      reason,
      disabled_message
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await supabaseAdmin.from('activity_logs').insert({
      admin_email: email,
      action: `feature.${is_enabled ? 'enabled' : 'disabled'}`,
      entity_type: 'feature_module',
      entity_id: module_key,
      details: { module_key, is_enabled, reason },
    });

    return NextResponse.json({ success: true, module_key, is_enabled });
  } catch (error) {
    console.error('Feature modules POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { email } = await getCurrentUserAdminRole();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { modules } = body;

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json({ error: 'modules array is required' }, { status: 400 });
    }

    const results = [];
    for (const mod of modules) {
      const result = await toggleFeatureModule(
        mod.module_key as FeatureModuleKey,
        mod.is_enabled,
        email!,
        mod.reason,
        mod.disabled_message
      );
      results.push({ module_key: mod.module_key, ...result });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Feature modules PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
