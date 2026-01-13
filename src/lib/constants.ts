/**
 * Application-wide constants
 */

export const SITE_CONFIG = {
  name: 'Little Grapplers',
  description: 'Youth Brazilian Jiu-Jitsu programs building confidence and character in kids ages 3-7 at partnered daycare facilities across Dallas-Fort Worth.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.littlegrapplers.net',
  ogImage: '/og.jpg',
  phone: '(469) 955-0516',
  email: 'info@littlegrapplers.net',
  address: {
    street: 'Dallas-Fort Worth Area',
    city: 'Dallas',
    state: 'TX',
    country: 'US',
  },
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

export const HOW_HEARD_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
  { value: 'word-of-mouth', label: 'Word of mouth' },
  { value: 'other', label: 'Others' },
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

/**
 * Admin configuration
 * 
 * SUPER_ADMIN_EMAILS: Full platform control (kill-switch, system settings, override all)
 * ADMIN_EMAILS: Standard admin access (manage students, CRUD operations, view dashboard)
 */
export const SUPER_ADMIN_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];

export const ADMIN_EMAILS = [
  ...SUPER_ADMIN_EMAILS,
  'info@littlegrapplers.net',
  'littlegrapplersjitsu@gmail.com',
];

export const DEVELOPER_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];

/**
 * Test/Admin emails to exclude from revenue metrics and user counts
 * These are internal accounts that should not be counted in business metrics
 */
export const EXCLUDED_FROM_METRICS_EMAILS = [
  'dangzr1@gmail.com',
  'walkawayy@icloud.com',
  'info@littlegrapplers.net',
  'littlegrapplersjitsu@gmail.com',
];

export const ADMIN_EMAIL = ADMIN_EMAILS[0]; // Legacy support - primary admin

/**
 * Admin role types
 */
export type AdminRole = 'super_admin' | 'admin' | 'none';

/**
 * Platform control configuration
 */
export const PLATFORM_CONFIG = {
  paymentGracePeriodDays: 5, // Auto-disable after this many days overdue
  statusCheckIntervalMs: 60000, // Check platform status every minute
} as const;

/**
 * Discussion locations (classes)
 * Each location is an isolated community with PIN-protected access
 */
export const DISCUSSION_LOCATIONS = [
  { id: 'lionheart-central', name: 'Lionheart Central Church', slug: 'lionheart-central-church', address: '2301 Premier Dr, Plano, TX 75075' },
  { id: 'lionheart-plano', name: 'Lionheart First Baptist Plano', slug: 'lionheart-first-baptist-plano', address: '3665 W President George Bush Hwy, Plano, TX 75075' },
  { id: 'pinnacle-montessori', name: 'Pinnacle at Montessori of St. Paul', slug: 'pinnacle-montessori', address: '2931 Parker Rd, Wylie, TX 75098' },
] as const;

export type DiscussionLocationId = (typeof DISCUSSION_LOCATIONS)[number]['id'];
