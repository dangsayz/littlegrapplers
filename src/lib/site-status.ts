// Site status configuration for freeze/maintenance mode
// Controlled via database (platform_status table) for production

import { SUPER_ADMIN_EMAILS } from './constants';

export interface SiteStatus {
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  reason?: string;
  allowedEmails: string[];
}

export interface PlatformStatusData {
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
}

// Super Admins who can always access the site and control platform status
export const MASTER_EMAILS = SUPER_ADMIN_EMAILS;

// Default site status - used as fallback
export const DEFAULT_SITE_STATUS: SiteStatus = {
  frozen: false,
  allowedEmails: MASTER_EMAILS,
};

// Check if email is a master (Super Admin)
export function isMasterEmail(email: string): boolean {
  return MASTER_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

// Get site freeze status from environment variable (legacy fallback)
export function getSiteFreezeStatus(): boolean {
  return process.env.SITE_FROZEN === 'true';
}

// Get freeze message (legacy fallback)
export function getFreezeMessage(): string {
  return process.env.SITE_FREEZE_MESSAGE || 
    'This site is temporarily unavailable for maintenance. Please contact the administrator.';
}

// Fetch platform status from API
export async function fetchPlatformStatus(): Promise<PlatformStatusData | null> {
  try {
    const res = await fetch('/api/admin/platform', {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
