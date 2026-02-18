import { supabaseAdmin } from './supabase';

export interface SchemaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Predictive schema validation - catches issues before they cause errors
 */
export async function validateEnrollmentSchema(): Promise<SchemaValidation> {
  const validation: SchemaValidation = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // 1. Check required enrollment columns
    const { data: enrollmentColumns, error: enrollmentError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'enrollments' });

    if (!enrollmentError && enrollmentColumns) {
      const requiredColumns = ['guardian_first_name', 'guardian_last_name', 'child_first_name', 'child_last_name', 'guardian_email'];
      const existingColumns = enrollmentColumns.map((col: any) => col.column_name);

      for (const required of requiredColumns) {
        if (!existingColumns.includes(required)) {
          validation.errors.push(`Missing required column: ${required}`);
          validation.isValid = false;
        }
      }
    }

    // 2. Check waiver table for guardian_name availability
    const { data: waiverColumns, error: waiverError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'signed_waivers' });

    if (!waiverError && waiverColumns) {
      const waiverColumnNames = waiverColumns.map((col: any) => col.column_name);
      
      if (!waiverColumnNames.includes('guardian_name')) {
        validation.warnings.push('waiver table missing guardian_name - will use email parsing fallback');
      }
    }

    // 3. Test data compatibility
    const { data: sampleWaiver, error: sampleError } = await supabaseAdmin
      .from('signed_waivers')
      .select('guardian_name, guardian_email, child_full_name')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!sampleError && sampleWaiver) {
      // Test name parsing logic
      const hasGuardianName = sampleWaiver.guardian_name && sampleWaiver.guardian_name.trim().length > 0;
      const hasValidEmail = sampleWaiver.guardian_email && sampleWaiver.guardian_email.includes('@');
      
      if (!hasGuardianName && !hasValidEmail) {
        validation.errors.push('Sample waiver has neither guardian_name nor valid email - cannot create enrollment');
        validation.isValid = false;
      }
    }

    // 4. Check for orphaned waivers that would fail enrollment creation
    const { data: orphanedCount, error: countError } = await supabaseAdmin
      .from('signed_waivers')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    if (!countError && orphanedCount) {
      const { data: matchingEnrollments } = await supabaseAdmin
        .from('enrollments')
        .select('guardian_email, child_first_name, child_last_name');

      if (matchingEnrollments) {
        // This is a simplified check - in production would be more sophisticated
        if (orphanedCount.length > matchingEnrollments.length) {
          validation.warnings.push(`Found ${orphanedCount.length} waivers but only ${matchingEnrollments.length} enrollments - potential orphaned waivers exist`);
        }
      }
    }

    return validation;
  } catch (error) {
    validation.errors.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    validation.isValid = false;
    return validation;
  }
}
