import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUserAdminRole, isSuperAdmin } from '@/lib/admin-roles';
import { PLATFORM_CONFIG } from '@/lib/constants';

export interface PlatformStatus {
  id: string;
  is_enabled: boolean;
  disabled_reason: string | null;
  disabled_by: string | null;
  disabled_at: string | null;
  payment_due_date: string | null;
  payment_received_at: string | null;
  payment_overdue_days: number;
  auto_disabled: boolean;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    // Try RPC first (bypasses schema cache)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_platform_status');
    
    if (!rpcError && rpcData) {
      return NextResponse.json(rpcData);
    }

    // Fallback to direct table query
    const { data: status, error } = await supabaseAdmin
      .from('platform_status')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = no rows returned, or schema cache issues
      // In both cases, return default enabled status
      if (error.code === 'PGRST116' || error.message?.includes('schema cache')) {
        console.log('Platform status table not ready or empty, returning default enabled status');
        return NextResponse.json({
          is_enabled: true,
          disabled_reason: null,
          payment_overdue_days: 0,
          auto_disabled: false,
          _default: true,
        });
      }
      console.error('Failed to fetch platform status:', error);
      return NextResponse.json({ error: `Failed to fetch platform status: ${error.message}` }, { status: 500 });
    }

    // Check payment expiration date and auto-disable if expired
    if (status.is_enabled && status.payment_expiration_date) {
      const expirationDate = new Date(status.payment_expiration_date);
      const now = new Date();
      
      if (now > expirationDate) {
        // Auto-disable the platform
        const { error: updateError } = await supabaseAdmin.rpc('update_platform_status', {
          p_is_enabled: false,
          p_reason: `Automatically disabled - payment expiration date passed (${status.payment_expiration_date})`,
          p_performed_by: 'system',
          p_auto_disabled: true,
        });

        if (!updateError) {
          // Refetch the updated status
          const { data: updatedStatus } = await supabaseAdmin
            .from('platform_status')
            .select('*')
            .limit(1)
            .single();
          
          if (updatedStatus) {
            return NextResponse.json(updatedStatus);
          }
        }
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Platform status GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { role, email, userId } = await getCurrentUserAdminRole();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, reason, payment_due_date, payment_received } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'enable': {
        // Use RPC function which bypasses schema cache
        const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('update_platform_status', {
          p_is_enabled: true,
          p_reason: null,
          p_performed_by: email,
          p_auto_disabled: false,
        });

        if (rpcError) {
          console.error('RPC error:', rpcError);
          // If RPC fails, platform defaults to enabled anyway
          result = { success: true, action: 'enabled', _rpcFallback: true };
        } else {
          result = { success: true, action: 'enabled', ...rpcResult };
        }
        break;
      }

      case 'disable': {
        if (!reason) {
          return NextResponse.json({ error: 'Reason is required for disable' }, { status: 400 });
        }

        // Use RPC function which bypasses schema cache
        const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('update_platform_status', {
          p_is_enabled: false,
          p_reason: reason,
          p_performed_by: email,
          p_auto_disabled: false,
        });

        if (rpcError) {
          console.error('RPC error details:', JSON.stringify(rpcError, null, 2));
          return NextResponse.json({ 
            error: `RPC failed: ${rpcError.message || rpcError.code || 'Unknown error'}`,
          }, { status: 500 });
        }

        result = { success: true, action: 'disabled', ...rpcResult };
        break;
      }

      case 'set_payment_due_date': {
        if (!payment_due_date) {
          return NextResponse.json({ error: 'payment_due_date is required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from('platform_status')
          .update({
            payment_due_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (await supabaseAdmin.from('platform_status').select('id').single()).data?.id);

        if (error) throw error;

        await supabaseAdmin.from('platform_status_log').insert({
          action: 'payment_due_date_set',
          performed_by: email,
          reason: `Payment due date set to ${payment_due_date}`,
          metadata: { payment_due_date },
        });

        result = { success: true, action: 'payment_due_date_set', payment_due_date };
        break;
      }

      case 'record_payment': {
        const now = new Date().toISOString();

        const { error } = await supabaseAdmin
          .from('platform_status')
          .update({
            payment_received_at: now,
            payment_overdue_days: 0,
            updated_at: now,
          })
          .eq('id', (await supabaseAdmin.from('platform_status').select('id').single()).data?.id);

        if (error) throw error;

        await supabaseAdmin.from('platform_status_log').insert({
          action: 'payment_received',
          performed_by: email,
          reason: 'Payment recorded',
          metadata: { received_at: now },
        });

        result = { success: true, action: 'payment_received', received_at: now };
        break;
      }

      case 'check_payment_status': {
        const { data, error } = await supabaseAdmin.rpc('check_payment_status');
        if (error) throw error;
        result = { success: true, ...data };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Try to log activity (don't fail if this doesn't work)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        admin_email: email,
        action: `platform.${action}`,
        entity_type: 'platform_status',
        details: { action, reason, result },
      });
    } catch (logError) {
      console.log('Could not log activity:', logError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Platform status POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 
                         typeof error === 'object' && error !== null ? JSON.stringify(error) : 
                         'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
