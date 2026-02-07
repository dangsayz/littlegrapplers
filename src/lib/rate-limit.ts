/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per key (IP or user ID) within a sliding window.
 * 
 * NOTE: This is per-instance. In serverless (Vercel), each cold start
 * gets a fresh map. This is acceptable — it still blocks rapid bursts
 * within a single instance lifetime.
 */

const rateLimitMaps = new Map<string, Map<string, number[]>>();

interface RateLimitConfig {
  /** Unique name for this limiter (e.g., 'enrollment', 'contact') */
  name: string;
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
  remaining: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();

  if (!rateLimitMaps.has(config.name)) {
    rateLimitMaps.set(config.name, new Map());
  }

  const map = rateLimitMaps.get(config.name)!;
  const timestamps = map.get(key) || [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < config.windowMs);

  if (valid.length >= config.maxRequests) {
    const oldestValid = valid[0];
    const retryAfterMs = config.windowMs - (now - oldestValid);
    return { allowed: false, retryAfterMs, remaining: 0 };
  }

  valid.push(now);
  map.set(key, valid);

  return { allowed: true, remaining: config.maxRequests - valid.length };
}

/** Pre-configured limiters matching RATE_LIMITS in constants */
export const LIMITERS = {
  enrollment: { name: 'enrollment', maxRequests: 5, windowMs: 60_000 },
  contact: { name: 'contact', maxRequests: 5, windowMs: 60_000 },
  newsletter: { name: 'newsletter', maxRequests: 3, windowMs: 60_000 },
  upload: { name: 'upload', maxRequests: 10, windowMs: 300_000 },
  waiver: { name: 'waiver', maxRequests: 5, windowMs: 60_000 },
} as const;

/** Extract client IP from request headers */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}
