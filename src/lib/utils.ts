import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD)
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Formats a date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Generates a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculates age from a birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }

  return age;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if a value is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates initials from a name (e.g., "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Belt rank display names
 */
export const BELT_RANKS = {
  white: 'White',
  'grey-white': 'Grey/White',
  grey: 'Grey',
  'grey-black': 'Grey/Black',
  'yellow-white': 'Yellow/White',
  yellow: 'Yellow',
  'yellow-black': 'Yellow/Black',
  'orange-white': 'Orange/White',
  orange: 'Orange',
  'orange-black': 'Orange/Black',
  'green-white': 'Green/White',
  green: 'Green',
  'green-black': 'Green/Black',
} as const;

export type BeltRank = keyof typeof BELT_RANKS;

/**
 * Gets the primary color for a belt rank
 */
export function getBeltColor(rank: BeltRank): string {
  if (rank.includes('white') && rank !== 'white') {
    return rank.split('-')[0];
  }
  if (rank.includes('black')) {
    return rank.split('-')[0];
  }
  return rank;
}
