import { supabaseAdmin } from './supabase';

/**
 * Enrollment Data Synchronization Utility
 * Ensures data consistency between enrollments and signed_waivers tables
 * 
 * Security: All operations use service role client with parameterized queries
 * Audit: All sync operations are logged
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SyncResult {
  success: boolean;
  syncedTables: string[];
  errors: string[];
  warnings: string[];
}

export interface WaiverToEnrollmentData {
  child_first_name: string;
  child_last_name: string;
  child_date_of_birth?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export interface EnrollmentToWaiverData {
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_email: string;
  guardian_phone?: string | null;
  child_first_name: string;
  child_last_name: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Split full name into first and last name
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' };
  }
  
  return {
    firstName: trimmed.substring(0, spaceIndex),
    lastName: trimmed.substring(spaceIndex + 1).trim(),
  };
}

/**
 * Combine first and last name into full name
 */
export function combineNames(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Log sync operation to activity_logs table
 */
async function logSyncOperation(
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>,
  userId?: string
): Promise<void> {
  try {
    await supabaseAdmin.from('activity_logs').insert({
      admin_id: null,
      admin_email: userId || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log sync operation:', error);
  }
}

// ============================================================================
// FIND LINKED RECORDS
// ============================================================================

/**
 * Find enrollment record linked to a signed_waiver by clerk_user_id and child name
 * Uses multiple matching strategies with fallbacks
 */
export async function findLinkedEnrollment(
  clerkUserId: string,
  childFullName: string
): Promise<{ id: string; location_id: string } | null> {
  const { firstName, lastName } = splitFullName(childFullName);
  
  // Strategy 1: Exact match on clerk_user_id + child name
  const { data: exactMatch } = await supabaseAdmin
    .from('enrollments')
    .select('id, location_id')
    .eq('clerk_user_id', clerkUserId)
    .eq('child_first_name', firstName)
    .eq('child_last_name', lastName)
    .in('status', ['pending', 'approved', 'active'])
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Strategy 2: Case-insensitive match
  const { data: caseInsensitiveMatch } = await supabaseAdmin
    .from('enrollments')
    .select('id, location_id')
    .eq('clerk_user_id', clerkUserId)
    .ilike('child_first_name', firstName)
    .ilike('child_last_name', lastName)
    .in('status', ['pending', 'approved', 'active'])
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch;
  }
  
  // Strategy 3: Match by clerk_user_id only if there's just one child
  const { data: singleChildMatch, count } = await supabaseAdmin
    .from('enrollments')
    .select('id, location_id', { count: 'exact' })
    .eq('clerk_user_id', clerkUserId)
    .in('status', ['pending', 'approved', 'active']);
  
  if (count === 1 && singleChildMatch && singleChildMatch.length === 1) {
    return singleChildMatch[0];
  }
  
  return null;
}

/**
 * Find signed_waiver record linked to an enrollment by clerk_user_id
 */
export async function findLinkedWaiver(
  clerkUserId: string,
  childFirstName: string,
  childLastName: string
): Promise<{ id: string } | null> {
  const fullName = combineNames(childFirstName, childLastName);
  
  // Strategy 1: Exact match on clerk_user_id + child name
  const { data: exactMatch } = await supabaseAdmin
    .from('signed_waivers')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .eq('child_full_name', fullName)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Strategy 2: Case-insensitive match
  const { data: caseInsensitiveMatch } = await supabaseAdmin
    .from('signed_waivers')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .ilike('child_full_name', fullName)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch;
  }
  
  // Strategy 3: Match by clerk_user_id only if there's just one active waiver
  const { data: singleWaiverMatch, count } = await supabaseAdmin
    .from('signed_waivers')
    .select('id', { count: 'exact' })
    .eq('clerk_user_id', clerkUserId)
    .eq('is_active', true);
  
  if (count === 1 && singleWaiverMatch && singleWaiverMatch.length === 1) {
    return singleWaiverMatch[0];
  }
  
  return null;
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Sync signed_waiver update to enrollments table
 * Called when parent updates their student info
 */
export async function syncWaiverToEnrollment(
  waiverId: string,
  clerkUserId: string,
  childFullName: string,
  updateData: WaiverToEnrollmentData
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedTables: [],
    errors: [],
    warnings: [],
  };
  
  try {
    // Find linked enrollment
    const enrollment = await findLinkedEnrollment(clerkUserId, childFullName);
    
    if (!enrollment) {
      result.warnings.push('No linked enrollment found - sync skipped');
      await logSyncOperation('sync.waiver_to_enrollment.no_link', 'signed_waiver', waiverId, {
        clerk_user_id: clerkUserId,
        child_name: childFullName,
        reason: 'No matching enrollment found',
      });
      return result;
    }
    
    // Update enrollment with waiver data
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        child_first_name: updateData.child_first_name,
        child_last_name: updateData.child_last_name,
        child_date_of_birth: updateData.child_date_of_birth || null,
        emergency_contact_name: updateData.emergency_contact_name || null,
        emergency_contact_phone: updateData.emergency_contact_phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      result.success = false;
      result.errors.push(`Failed to sync to enrollments: ${updateError.message}`);
      console.error('Sync waiver to enrollment error:', updateError);
    } else {
      result.syncedTables.push('enrollments');
    }
    
    // Log successful sync
    await logSyncOperation('sync.waiver_to_enrollment.success', 'signed_waiver', waiverId, {
      enrollment_id: enrollment.id,
      synced_fields: Object.keys(updateData),
    }, clerkUserId);
    
  } catch (error) {
    result.success = false;
    result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Sync waiver to enrollment exception:', error);
  }
  
  return result;
}

/**
 * Sync enrollment update to signed_waivers table
 * Called when admin updates enrollment info
 */
export async function syncEnrollmentToWaiver(
  enrollmentId: string,
  clerkUserId: string | null,
  updateData: EnrollmentToWaiverData
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedTables: [],
    errors: [],
    warnings: [],
  };
  
  if (!clerkUserId) {
    result.warnings.push('No clerk_user_id - cannot sync to signed_waivers');
    return result;
  }
  
  try {
    // Find linked waiver
    const waiver = await findLinkedWaiver(
      clerkUserId,
      updateData.child_first_name,
      updateData.child_last_name
    );
    
    if (!waiver) {
      result.warnings.push('No linked signed_waiver found - sync skipped');
      await logSyncOperation('sync.enrollment_to_waiver.no_link', 'enrollment', enrollmentId, {
        clerk_user_id: clerkUserId,
        child_name: combineNames(updateData.child_first_name, updateData.child_last_name),
        reason: 'No matching waiver found',
      });
      return result;
    }
    
    // Update signed_waiver with enrollment data
    const { error: updateError } = await supabaseAdmin
      .from('signed_waivers')
      .update({
        guardian_full_name: combineNames(updateData.guardian_first_name, updateData.guardian_last_name),
        guardian_email: updateData.guardian_email,
        guardian_phone: updateData.guardian_phone || null,
        child_full_name: combineNames(updateData.child_first_name, updateData.child_last_name),
        emergency_contact_name: updateData.emergency_contact_name || null,
        emergency_contact_phone: updateData.emergency_contact_phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', waiver.id);
    
    if (updateError) {
      result.success = false;
      result.errors.push(`Failed to sync to signed_waivers: ${updateError.message}`);
      console.error('Sync enrollment to waiver error:', updateError);
    } else {
      result.syncedTables.push('signed_waivers');
    }
    
    // Log successful sync
    await logSyncOperation('sync.enrollment_to_waiver.success', 'enrollment', enrollmentId, {
      waiver_id: waiver.id,
      synced_fields: Object.keys(updateData),
    });
    
  } catch (error) {
    result.success = false;
    result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Sync enrollment to waiver exception:', error);
  }
  
  return result;
}

/**
 * Sync soft-delete from signed_waiver to enrollment
 * Called when parent removes a student
 */
export async function syncWaiverDeactivation(
  waiverId: string,
  clerkUserId: string,
  childFullName: string,
  reason: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedTables: [],
    errors: [],
    warnings: [],
  };
  
  try {
    const enrollment = await findLinkedEnrollment(clerkUserId, childFullName);
    
    if (!enrollment) {
      result.warnings.push('No linked enrollment found - deactivation sync skipped');
      return result;
    }
    
    // Update enrollment status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      result.success = false;
      result.errors.push(`Failed to sync deactivation: ${updateError.message}`);
    } else {
      result.syncedTables.push('enrollments');
    }
    
    await logSyncOperation('sync.waiver_deactivation', 'signed_waiver', waiverId, {
      enrollment_id: enrollment.id,
      reason,
    }, clerkUserId);
    
  } catch (error) {
    result.success = false;
    result.errors.push(`Deactivation sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}

/**
 * Sync reactivation from signed_waiver to enrollment
 * Called when parent reactivates a student
 */
export async function syncWaiverReactivation(
  waiverId: string,
  clerkUserId: string,
  childFullName: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    syncedTables: [],
    errors: [],
    warnings: [],
  };
  
  try {
    // For reactivation, we need to find even cancelled enrollments
    const { firstName, lastName } = splitFullName(childFullName);
    
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .eq('child_first_name', firstName)
      .eq('child_last_name', lastName)
      .eq('status', 'cancelled')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!enrollment) {
      result.warnings.push('No cancelled enrollment found to reactivate');
      return result;
    }
    
    // Reactivate enrollment
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'active',
        cancellation_reason: null,
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);
    
    if (updateError) {
      result.success = false;
      result.errors.push(`Failed to sync reactivation: ${updateError.message}`);
    } else {
      result.syncedTables.push('enrollments');
    }
    
    await logSyncOperation('sync.waiver_reactivation', 'signed_waiver', waiverId, {
      enrollment_id: enrollment.id,
    }, clerkUserId);
    
  } catch (error) {
    result.success = false;
    result.errors.push(`Reactivation sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}
