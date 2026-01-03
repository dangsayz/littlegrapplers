// Site status configuration for freeze/maintenance mode
// This can be controlled by developers when client hasn't paid

export interface SiteStatus {
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  reason?: string;
  allowedEmails: string[];
}

// Master developers who can always access the site and control freeze
export const MASTER_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];

// Default site status - stored in localStorage on client, 
// but controlled via API/env for production
export const DEFAULT_SITE_STATUS: SiteStatus = {
  frozen: false,
  allowedEmails: MASTER_EMAILS,
};

// Check if email is a master (developer)
export function isMasterEmail(email: string): boolean {
  return MASTER_EMAILS.includes(email.toLowerCase());
}

// Get site freeze status from environment variable
export function getSiteFreezeStatus(): boolean {
  return process.env.SITE_FROZEN === 'true';
}

// Get freeze message
export function getFreezeMessage(): string {
  return process.env.SITE_FREEZE_MESSAGE || 
    'This site is temporarily unavailable for maintenance. Please contact the administrator.';
}
