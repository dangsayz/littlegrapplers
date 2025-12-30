import { z } from 'zod';

/**
 * Input Validation & Sanitization Library
 * Protects against XSS, SQL injection, and ensures proper data formatting
 */

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and escapes special characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize email - lowercase and trim
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

/**
 * Format phone number to 000-000-0000 format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle US phone numbers (10 digits)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  
  // Handle numbers with country code (11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
  
  return digits;
}

/**
 * Sanitize and validate all fields in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// ============================================================================
// CHARACTER LIMITS
// ============================================================================

export const CHAR_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 5, max: 254 },
  phone: { min: 10, max: 20 },
  message: { min: 1, max: 2000 },
  shortText: { min: 1, max: 200 },
  mediumText: { min: 1, max: 500 },
  signature: { min: 2, max: 150 },
  address: { min: 1, max: 300 },
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  // Strict email validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // US Phone: 000-000-0000
  phone: /^\d{3}-\d{3}-\d{4}$/,
  // Phone digits only (for validation before formatting)
  phoneDigits: /^\d{10,11}$/,
  // Name: letters, spaces, hyphens, apostrophes
  name: /^[a-zA-Z\s'-]+$/,
  // Alphanumeric with basic punctuation
  safeText: /^[a-zA-Z0-9\s.,!?'"-]*$/,
  // Date: YYYY-MM-DD
  date: /^\d{4}-\d{2}-\d{2}$/,
  // UUID
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// Base field schemas
export const nameSchema = z
  .string()
  .min(CHAR_LIMITS.name.min, 'Name is required')
  .max(CHAR_LIMITS.name.max, `Name must be less than ${CHAR_LIMITS.name.max} characters`)
  .regex(PATTERNS.name, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(sanitizeString);

export const emailSchema = z
  .string()
  .min(CHAR_LIMITS.email.min, 'Email is required')
  .max(CHAR_LIMITS.email.max, `Email must be less than ${CHAR_LIMITS.email.max} characters`)
  .email('Please enter a valid email address')
  .transform(sanitizeEmail);

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .max(CHAR_LIMITS.phone.max, 'Phone number is too long')
  .transform(formatPhoneNumber)
  .refine((val) => PATTERNS.phone.test(val), {
    message: 'Please enter a valid phone number (000-000-0000)',
  });

export const optionalPhoneSchema = z
  .string()
  .max(CHAR_LIMITS.phone.max, 'Phone number is too long')
  .transform((val) => (val ? formatPhoneNumber(val) : ''))
  .refine((val) => !val || PATTERNS.phone.test(val), {
    message: 'Please enter a valid phone number (000-000-0000)',
  })
  .optional();

export const messageSchema = z
  .string()
  .min(CHAR_LIMITS.message.min, 'Message is required')
  .max(CHAR_LIMITS.message.max, `Message must be less than ${CHAR_LIMITS.message.max} characters`)
  .transform(sanitizeString);

export const shortTextSchema = z
  .string()
  .min(CHAR_LIMITS.shortText.min, 'This field is required')
  .max(CHAR_LIMITS.shortText.max, `Must be less than ${CHAR_LIMITS.shortText.max} characters`)
  .transform(sanitizeString);

export const optionalTextSchema = z
  .string()
  .max(CHAR_LIMITS.mediumText.max, `Must be less than ${CHAR_LIMITS.mediumText.max} characters`)
  .transform(sanitizeString)
  .optional();

export const signatureSchema = z
  .string()
  .min(CHAR_LIMITS.signature.min, 'Signature is required')
  .max(CHAR_LIMITS.signature.max, `Signature must be less than ${CHAR_LIMITS.signature.max} characters`)
  .transform(sanitizeString);

export const dateSchema = z
  .string()
  .regex(PATTERNS.date, 'Please enter a valid date (YYYY-MM-DD)')
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date');

export const uuidSchema = z
  .string()
  .regex(PATTERNS.uuid, 'Invalid ID format');

// ============================================================================
// FORM SCHEMAS
// ============================================================================

// Contact Form Schema
export const contactFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  hearAbout: shortTextSchema,
  message: messageSchema,
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  source: z.string().max(50).optional(),
});

// Waiver Form Schema
export const waiverFormSchema = z.object({
  guardianFullName: nameSchema,
  guardianEmail: emailSchema,
  guardianPhone: phoneSchema.optional(),
  childFullName: nameSchema,
  childDateOfBirth: dateSchema.optional(),
  emergencyContactName: nameSchema.optional(),
  emergencyContactPhone: optionalPhoneSchema,
  planType: z.enum(['month-to-month', '3-month', '6-month']).optional(),
  digitalSignature: signatureSchema,
  photoMediaConsent: z.boolean(),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
  locationId: uuidSchema.optional(),
});

// Dashboard Waiver Schema
export const dashboardWaiverSchema = z.object({
  guardianFullName: nameSchema,
  guardianEmail: emailSchema,
  guardianPhone: phoneSchema,
  childFullName: nameSchema,
  childDateOfBirth: dateSchema,
  emergencyContactName: nameSchema,
  emergencyContactPhone: phoneSchema,
  locationId: uuidSchema,
  digitalSignature: signatureSchema,
  photoMediaConsent: z.boolean(),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms' }),
  }),
  clerkUserId: z.string().min(1),
});

// Onboarding Form Schema
export const onboardingFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  emergencyContactName: nameSchema,
  emergencyContactPhone: phoneSchema,
  studentFirstName: nameSchema,
  studentLastName: nameSchema,
  studentDob: dateSchema,
  locationId: uuidSchema,
  medicalConditions: optionalTextSchema,
  tshirtSize: z.string().max(20).optional(),
  howHeard: optionalTextSchema,
  photoConsent: z.boolean(),
  waiverAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the liability waiver' }),
  }),
});

// Community Discussion Schema
export const discussionSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeString),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters')
    .transform(sanitizeString),
  locationSlug: z.string().max(100).optional(),
});

// Reply Schema
export const replySchema = z.object({
  content: z
    .string()
    .min(1, 'Reply cannot be empty')
    .max(2000, 'Reply must be less than 2000 characters')
    .transform(sanitizeString),
});

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  contact: { windowMs: 60 * 1000, maxRequests: 3 },      // 3 per minute
  newsletter: { windowMs: 60 * 1000, maxRequests: 3 },   // 3 per minute
  waiver: { windowMs: 60 * 1000, maxRequests: 5 },       // 5 per minute
  discussion: { windowMs: 60 * 1000, maxRequests: 5 },   // 5 per minute
  reply: { windowMs: 30 * 1000, maxRequests: 3 },        // 3 per 30 seconds
  onboarding: { windowMs: 60 * 1000, maxRequests: 5 },   // 5 per minute
  default: { windowMs: 60 * 1000, maxRequests: 10 },     // 10 per minute
};

/**
 * Check if request should be rate limited
 * Returns true if rate limit exceeded
 */
export function isRateLimited(
  identifier: string,
  endpoint: string = 'default'
): { limited: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  entry.count++;
  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Get client identifier from request for rate limiting
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and parse data with a Zod schema
 * Returns either parsed data or error message
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid data format' };
  }
}

/**
 * Create a validation response for API routes
 */
export function createValidationError(message: string, status: number = 400) {
  return {
    error: message,
    status,
  };
}

// ============================================================================
// HONEYPOT SPAM DETECTION
// ============================================================================

/**
 * Check for honeypot field (should be empty if real user)
 */
export function checkHoneypot(data: Record<string, unknown>): boolean {
  const honeypotFields = ['website', 'url', 'company_website', 'fax'];
  
  for (const field of honeypotFields) {
    if (data[field] && String(data[field]).trim() !== '') {
      return true; // Bot detected
    }
  }
  
  return false;
}

/**
 * Check submission timing (too fast = bot)
 */
export function checkSubmissionTiming(
  formLoadTime: number | undefined,
  minSeconds: number = 3
): boolean {
  if (!formLoadTime) return false;
  
  const submissionTime = Date.now();
  const elapsed = (submissionTime - formLoadTime) / 1000;
  
  return elapsed < minSeconds; // Too fast, likely bot
}

// Type exports
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type WaiverFormData = z.infer<typeof waiverFormSchema>;
export type DashboardWaiverData = z.infer<typeof dashboardWaiverSchema>;
export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
export type DiscussionData = z.infer<typeof discussionSchema>;
export type ReplyData = z.infer<typeof replySchema>;
