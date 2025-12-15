/**
 * Application-wide constants
 */

export const SITE_CONFIG = {
  name: 'Little Grapplers',
  description: 'Youth Brazilian Jiu-Jitsu programs at partnered daycare facilities',
  url: 'https://littlegrapplers.net',
  ogImage: '/og.jpg',
} as const;

export const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Programs', href: '/programs' },
  { label: 'Locations', href: '/locations' },
  { label: 'Benefits', href: '/benefits' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const;

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Parents', href: '/admin/parents', icon: 'Users' },
      { label: 'Students', href: '/admin/students', icon: 'GraduationCap' },
    ],
  },
  {
    title: 'Programs',
    items: [
      { label: 'Locations', href: '/admin/locations', icon: 'MapPin' },
      { label: 'Programs', href: '/admin/programs', icon: 'Calendar' },
      { label: 'Memberships', href: '/admin/memberships', icon: 'CreditCard' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Videos', href: '/admin/videos', icon: 'Video' },
      { label: 'Discussions', href: '/admin/discussions', icon: 'MessageSquare' },
      { label: 'Announcements', href: '/admin/announcements', icon: 'Megaphone' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Content Editor', href: '/admin/content', icon: 'FileEdit' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
    ],
  },
] as const;

export const PORTAL_NAV_ITEMS = [
  { label: 'Dashboard', href: '/portal', icon: 'LayoutDashboard' },
  { label: 'My Students', href: '/portal/my-students', icon: 'Users' },
  { label: 'Videos', href: '/portal/videos', icon: 'Video' },
  { label: 'Discussions', href: '/portal/discussions', icon: 'MessageSquare' },
  { label: 'Announcements', href: '/portal/announcements', icon: 'Megaphone' },
  { label: 'Settings', href: '/portal/settings', icon: 'Settings' },
] as const;

export const MEMBERSHIP_STATUSES = {
  active: { label: 'Active', color: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-yellow-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
  pending: { label: 'Pending', color: 'bg-blue-500' },
} as const;

export const ANNOUNCEMENT_TYPES = {
  general: { label: 'General', icon: 'Bell' },
  'student-of-month': { label: 'Student of the Month', icon: 'Trophy' },
  event: { label: 'Event', icon: 'Calendar' },
  'schedule-change': { label: 'Schedule Change', icon: 'Clock' },
} as const;

export const VIDEO_CATEGORIES = [
  'Fundamentals',
  'Self-Defense',
  'Games',
  'Warm-Ups',
  'Techniques',
  'Competition Prep',
] as const;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
] as const;

export const BELT_PROGRESSION = [
  'white',
  'grey-white',
  'grey',
  'grey-black',
  'yellow-white',
  'yellow',
  'yellow-black',
  'orange-white',
  'orange',
  'orange-black',
  'green-white',
  'green',
  'green-black',
] as const;

export const MAX_STRIPES = 4;

export const CONTACT_REASONS = [
  { value: 'enrollment', label: 'Enrollment Inquiry' },
  { value: 'partnership', label: 'Daycare Partnership' },
  { value: 'general', label: 'General Question' },
  { value: 'support', label: 'Account Support' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * API rate limiting configuration
 */
export const RATE_LIMITS = {
  auth: { requests: 10, windowMs: 60000 }, // 10 per minute
  api: { requests: 100, windowMs: 60000 }, // 100 per minute
  upload: { requests: 10, windowMs: 300000 }, // 10 per 5 minutes
} as const;

/**
 * File upload limits
 */
export const UPLOAD_LIMITS = {
  image: { maxSizeMB: 10, types: ['image/jpeg', 'image/png', 'image/webp'] },
  video: { maxSizeMB: 100, types: ['video/mp4', 'video/webm'] },
} as const;
