import { currentUser } from '@clerk/nextjs/server';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAILS, type AdminRole } from './constants';

/**
 * Get the admin role for a given email
 */
export function getAdminRole(email: string | null | undefined): AdminRole {
  if (!email) return 'none';
  
  const normalizedEmail = email.toLowerCase();
  
  if (SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
    return 'super_admin';
  }
  
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    return 'admin';
  }
  
  return 'none';
}

/**
 * Check if email is a Super Admin
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  return getAdminRole(email) === 'super_admin';
}

/**
 * Check if email is any type of admin (Super Admin or Regular Admin)
 */
export function isAdmin(email: string | null | undefined): boolean {
  const role = getAdminRole(email);
  return role === 'super_admin' || role === 'admin';
}

/**
 * Get admin role from Clerk current user (server-side)
 */
export async function getCurrentUserAdminRole(): Promise<{
  role: AdminRole;
  email: string | null;
  userId: string | null;
}> {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress || null;
  
  return {
    role: getAdminRole(email),
    email,
    userId: user?.id || null,
  };
}

/**
 * Require Super Admin access - throws if not authorized
 */
export async function requireSuperAdmin(): Promise<{
  email: string;
  userId: string;
}> {
  const { role, email, userId } = await getCurrentUserAdminRole();
  
  if (role !== 'super_admin') {
    throw new Error('Super Admin access required');
  }
  
  if (!email || !userId) {
    throw new Error('Authentication required');
  }
  
  return { email, userId };
}

/**
 * Require Admin access (Super Admin or Regular Admin) - throws if not authorized
 */
export async function requireAdmin(): Promise<{
  email: string;
  userId: string;
  role: AdminRole;
}> {
  const { role, email, userId } = await getCurrentUserAdminRole();
  
  if (role === 'none') {
    throw new Error('Admin access required');
  }
  
  if (!email || !userId) {
    throw new Error('Authentication required');
  }
  
  return { email, userId, role };
}

/**
 * Permission checks for specific actions
 */
export const permissions = {
  canControlPlatform: (role: AdminRole) => role === 'super_admin',
  canAccessSystemSettings: (role: AdminRole) => role === 'super_admin',
  canOverrideRestrictions: (role: AdminRole) => role === 'super_admin',
  canManageStudents: (role: AdminRole) => role === 'super_admin' || role === 'admin',
  canApprovePending: (role: AdminRole) => role === 'super_admin' || role === 'admin',
  canViewDashboard: (role: AdminRole) => role === 'super_admin' || role === 'admin',
  canManageContent: (role: AdminRole) => role === 'super_admin' || role === 'admin',
} as const;
