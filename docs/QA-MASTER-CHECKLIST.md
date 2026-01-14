# Little Grapplers - QA Master Checklist

> **The GOD-TIER testing document**  
> Run through this before every major deployment to ensure ALL scenarios are covered.
> Last Updated: January 2026

---

## Quick Pre-Deploy Checks

```bash
# Run these commands before any deployment
pnpm build                    # Ensure build passes
pnpm lint                     # No lint errors
pnpm typecheck               # TypeScript passes
```

---

## 1. Authentication Flows

### 1.1 Sign Up (Clerk)
| Scenario | Expected | Status |
|----------|----------|--------|
| New user signs up with email | Account created, redirected to /onboarding | [ ] |
| Sign up with existing email | Error: "Email already in use" | [ ] |
| Sign up with weak password | Clerk validation error shown | [ ] |
| Sign up with Google OAuth | Account created, redirected to /onboarding | [ ] |
| Email verification link clicked | Account verified, can access dashboard | [ ] |
| Expired verification link | Error message, option to resend | [ ] |

### 1.2 Sign In
| Scenario | Expected | Status |
|----------|----------|--------|
| Valid credentials | Redirected to /dashboard | [ ] |
| Invalid email | Error: "Invalid credentials" | [ ] |
| Invalid password | Error: "Invalid credentials" | [ ] |
| Forgot password flow | Email sent, can reset password | [ ] |
| Brute force protection | Rate limited after X attempts | [ ] |
| Session expiry | Redirected to /sign-in | [ ] |

### 1.3 Sign Out
| Scenario | Expected | Status |
|----------|----------|--------|
| Click sign out | Logged out, redirected to home | [ ] |
| Access protected route after logout | Redirected to /sign-in | [ ] |

---

## 2. Onboarding Flow

### 2.1 New User Onboarding (/onboarding)
| Scenario | Expected | Status |
|----------|----------|--------|
| Complete step 1 (parent info) | Data saved, proceed to step 2 | [ ] |
| Complete step 2 (student info) | Data saved, proceed to step 3 | [ ] |
| Complete step 3 (consent) | Redirected to dashboard | [ ] |
| Skip optional fields | Form submits successfully | [ ] |
| Invalid phone number | Validation error shown | [ ] |
| Invalid date of birth | Validation error shown | [ ] |
| Browser back during onboarding | Previous step data retained | [ ] |
| Refresh during onboarding | Data persists (draft saved) | [ ] |

---

## 3. Waiver Flow

### 3.1 Public Waiver (/waiver)
| Scenario | Expected | Status |
|----------|----------|--------|
| Fill out all required fields | Submit button enabled | [ ] |
| Submit valid waiver | Success message, next steps shown | [ ] |
| Missing required field | Validation error shown | [ ] |
| Invalid email format | Validation error shown | [ ] |
| Digital signature not provided | Form won't submit | [ ] |
| Terms not accepted | Form won't submit | [ ] |
| Honeypot triggered (bot) | Silent success (no actual save) | [ ] |
| Rate limit exceeded | "Too many requests" error | [ ] |
| Refresh after success | Can submit another waiver | [ ] |

### 3.2 Dashboard Waiver (/dashboard/waiver)
| Scenario | Expected | Status |
|----------|----------|--------|
| User without waiver sees form | Form displayed | [ ] |
| User with waiver sees status | "Waiver Signed" view shown | [ ] |
| Submit waiver | Redirects to /dashboard/checkout after 2s | [ ] |
| Admin notification sent | Email received by admin | [ ] |

---

## 4. Payment & Checkout Flow

### 4.1 Checkout Page (/dashboard/checkout)
| Scenario | Expected | Status |
|----------|----------|--------|
| Page loads with plan options | Both plans displayed (3-month, monthly) | [ ] |
| 3-month plan selected | Card highlighted, $150 shown | [ ] |
| Monthly plan selected | Card highlighted, $50/mo shown | [ ] |
| "Continue to Payment" clicked | Redirects to Stripe Checkout | [ ] |
| No waiver signed | Error: "Please complete waiver first" | [ ] |
| Stripe checkout cancelled | Returns to checkout with message | [ ] |

### 4.2 Stripe Checkout (External)
| Scenario | Expected | Status |
|----------|----------|--------|
| Valid card payment | Success, redirect to success page | [ ] |
| Card declined | Stripe error message shown | [ ] |
| 3D Secure required | Handled by Stripe | [ ] |
| User closes tab during payment | No subscription created | [ ] |

### 4.3 Checkout Success (/dashboard/checkout/success)
| Scenario | Expected | Status |
|----------|----------|--------|
| Successful payment | Welcome message displayed | [ ] |
| Links to dashboard work | Navigate correctly | [ ] |

### 4.4 Webhooks (Background)
| Scenario | Expected | Status |
|----------|----------|--------|
| checkout.session.completed (one-time) | Subscription record created | [ ] |
| checkout.session.completed (subscription) | Handled by subscription event | [ ] |
| customer.subscription.created | Subscription record created | [ ] |
| customer.subscription.updated | Subscription record updated | [ ] |
| customer.subscription.deleted | Subscription status = canceled | [ ] |
| Invalid webhook signature | 400 error returned | [ ] |
| Missing webhook secret | 500 error, logged | [ ] |

---

## 5. Dashboard Flows

### 5.1 Dashboard Home (/dashboard)
| Scenario | Expected | Status |
|----------|----------|--------|
| Page loads for new user | Welcome state, quick actions shown | [ ] |
| Page loads for enrolled user | Stats, recent activity shown | [ ] |
| Mobile navigation works | Hamburger menu opens/closes | [ ] |
| All navigation links work | Routes correctly | [ ] |

### 5.2 Students (/dashboard/students)
| Scenario | Expected | Status |
|----------|----------|--------|
| No students | Empty state with CTA | [ ] |
| Students listed | Cards displayed with details | [ ] |
| Click student card | Navigate to student detail | [ ] |
| Add student | Form displayed, creates student | [ ] |
| Edit student | Form pre-filled, updates on save | [ ] |

### 5.3 Memberships (/dashboard/memberships)
| Scenario | Expected | Status |
|----------|----------|--------|
| No memberships | Empty state shown | [ ] |
| Active membership | Card with status shown | [ ] |
| Pending request shown | Yellow highlighted section | [ ] |
| Pause membership request | Request created, pending review | [ ] |
| Cancel membership request | Request created, pending review | [ ] |

### 5.4 Discussions (/dashboard/discussions)
| Scenario | Expected | Status |
|----------|----------|--------|
| User without location access | Prompted to enter PIN | [ ] |
| Valid PIN entered | Access granted, threads shown | [ ] |
| Invalid PIN | Error message shown | [ ] |
| Create new thread | Thread created, visible in list | [ ] |
| Reply to thread | Reply saved, shown in thread | [ ] |
| Edit own reply | Updated successfully | [ ] |
| Delete own reply | Removed from thread | [ ] |

### 5.5 Billing (/dashboard/billing)
| Scenario | Expected | Status |
|----------|----------|--------|
| No payment history | Empty state | [ ] |
| Payment history exists | Transactions listed | [ ] |
| Make payment button | Initiates checkout | [ ] |

### 5.6 Settings (/dashboard/settings)
| Scenario | Expected | Status |
|----------|----------|--------|
| View profile info | Current data displayed | [ ] |
| Update profile | Changes saved | [ ] |
| Invalid phone format | Validation error | [ ] |

---

## 6. Admin Flows

### 6.1 Admin Access
| Scenario | Expected | Status |
|----------|----------|--------|
| Non-admin accesses /dashboard/admin | Redirect or 403 | [ ] |
| Admin accesses admin panel | Full access granted | [ ] |

### 6.2 Admin Dashboard (/dashboard/admin)
| Scenario | Expected | Status |
|----------|----------|--------|
| KPIs displayed | Revenue, students, locations shown | [ ] |
| Recent activity shown | Latest waivers, enrollments | [ ] |
| Quick actions work | Navigate to correct pages | [ ] |

### 6.3 Enrollments Management
| Scenario | Expected | Status |
|----------|----------|--------|
| View pending enrollments | List displayed | [ ] |
| Approve enrollment | Status updated, notification sent | [ ] |
| Reject enrollment | Status updated, reason logged | [ ] |
| Bulk approve | Multiple updated | [ ] |

### 6.4 Students Management
| Scenario | Expected | Status |
|----------|----------|--------|
| View all students | Table with filters | [ ] |
| Search students | Results filtered | [ ] |
| Edit student belt rank | Updated in DB | [ ] |
| Delete student | Confirmation required, deleted | [ ] |

### 6.5 Financials (/dashboard/admin/financials)
| Scenario | Expected | Status |
|----------|----------|--------|
| Revenue metrics displayed | Calculated from Stripe data | [ ] |
| Per-location breakdown | Data segmented correctly | [ ] |
| Export functionality | CSV downloaded | [ ] |

### 6.6 Announcements
| Scenario | Expected | Status |
|----------|----------|--------|
| Create announcement | Published to users | [ ] |
| Edit announcement | Changes saved | [ ] |
| Delete announcement | Removed from system | [ ] |
| Location-scoped announcement | Only visible to that location | [ ] |

### 6.7 Media Management
| Scenario | Expected | Status |
|----------|----------|--------|
| Upload image | Saved to storage | [ ] |
| Upload video (YouTube embed) | Saved and playable | [ ] |
| Delete media | Removed from storage | [ ] |

---

## 7. Community Features

### 7.1 Community Pages (/community/[slug])
| Scenario | Expected | Status |
|----------|----------|--------|
| Valid location slug | Community page loads | [ ] |
| Invalid location slug | 404 page | [ ] |
| PIN required | Modal shown for PIN entry | [ ] |
| Correct PIN | Access granted | [ ] |
| Incorrect PIN | Error message | [ ] |

### 7.2 Thread Operations
| Scenario | Expected | Status |
|----------|----------|--------|
| Create thread | Appears in thread list | [ ] |
| View thread | All replies loaded | [ ] |
| Reply to thread | Reply saved | [ ] |
| Admin can delete any reply | Reply removed | [ ] |
| User can only delete own | Others protected | [ ] |

---

## 8. Email Notifications

### 8.1 Transactional Emails
| Scenario | Expected | Status |
|----------|----------|--------|
| Waiver signed → Admin notified | Email sent to admin | [ ] |
| Enrollment approved → Parent notified | Email sent to parent | [ ] |
| Payment successful → Receipt sent | Email with details | [ ] |
| Password reset requested | Reset link sent | [ ] |

### 8.2 Email Delivery
| Scenario | Expected | Status |
|----------|----------|--------|
| Valid email address | Email delivered | [ ] |
| Invalid email format | Caught at validation | [ ] |
| Resend API error | Logged, graceful failure | [ ] |

---

## 9. Edge Cases & Error Handling

### 9.1 Network & API Errors
| Scenario | Expected | Status |
|----------|----------|--------|
| API timeout | Loading state, then error message | [ ] |
| 500 server error | User-friendly error page | [ ] |
| 404 not found | Custom 404 page | [ ] |
| Network offline | Offline indicator (if implemented) | [ ] |

### 9.2 Data Validation
| Scenario | Expected | Status |
|----------|----------|--------|
| XSS in text fields | Sanitized, no script execution | [ ] |
| SQL injection attempt | Query parameterized, fails safely | [ ] |
| Oversized file upload | Error with size limit info | [ ] |
| Invalid date format | Validation error | [ ] |
| Future date of birth | Validation error | [ ] |
| Very old date of birth | Validation error (>120 years) | [ ] |

### 9.3 Concurrent Operations
| Scenario | Expected | Status |
|----------|----------|--------|
| Double form submit | Prevented (button disabled) | [ ] |
| Same user, two tabs | Session consistent | [ ] |
| Stale data update | Handled gracefully | [ ] |

### 9.4 Form Data Persistence (Auto-Save)

> **Added after user feedback:** Forms should not lose data on refresh/error.

| Scenario | Expected | Status |
|----------|----------|--------|
| Page refresh during form entry | Form data restored from localStorage | [ ] |
| Error occurs, user refreshes | Form data preserved | [ ] |
| Successful submission | Saved draft cleared | [ ] |
| Browser closed, reopened | Draft data still available | [ ] |

**Implementation Checklist:**
- [ ] Multi-step forms save to localStorage on every change
- [ ] Current step is also saved and restored
- [ ] Draft is cleared on successful submission
- [ ] Uses unique storage key per form (e.g., `littlegrapplers_onboarding_draft`)

### 9.5 Browser Compatibility
| Scenario | Expected | Status |
|----------|----------|--------|
| Chrome (latest) | Full functionality | [ ] |
| Safari (latest) | Full functionality | [ ] |
| Firefox (latest) | Full functionality | [ ] |
| Mobile Safari (iOS) | Full functionality | [ ] |
| Mobile Chrome (Android) | Full functionality | [ ] |

---

## 10. Performance Checks

### 10.1 Core Web Vitals
| Metric | Target | Status |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | [ ] |
| FID (First Input Delay) | < 100ms | [ ] |
| CLS (Cumulative Layout Shift) | < 0.1 | [ ] |

### 10.2 Load Testing
| Scenario | Expected | Status |
|----------|----------|--------|
| Homepage loads | < 1s TTFB | [ ] |
| Dashboard loads | < 2s with data | [ ] |
| Image optimization | WebP served | [ ] |
| Video loads | Streaming starts < 2s | [ ] |

---

## 11. Security Checks (Enterprise-Grade)

> **Standard:** PCI DSS Level 4, OWASP Top 10, SOC 2 Type II aligned
> These checks reflect world-class security practices used by Stripe, Square, and enterprise payment platforms.

---

### 11.1 Authentication Security (OWASP A07:2021)
| Check | Status | Severity |
|-------|--------|----------|
| HTTPS enforced on all routes | [ ] | CRITICAL |
| Secure cookies (HttpOnly, Secure, SameSite=Strict) | [ ] | CRITICAL |
| Session timeout ≤ 30 mins inactive | [ ] | HIGH |
| Password min 8 chars, 1 upper, 1 number, 1 special | [ ] | HIGH |
| Brute force protection (Clerk rate limiting) | [ ] | CRITICAL |
| Multi-factor authentication available | [ ] | MEDIUM |
| Account lockout after 5 failed attempts | [ ] | HIGH |
| Secure password reset flow (time-limited tokens) | [ ] | HIGH |
| No credentials in URLs or logs | [ ] | CRITICAL |

### 11.2 Authorization & Access Control (OWASP A01:2021)
| Check | Status | Severity |
|-------|--------|----------|
| Admin routes return 403 for non-admins | [ ] | CRITICAL |
| Users can only access own data (IDOR prevention) | [ ] | CRITICAL |
| API endpoints validate auth on ALL routes | [ ] | CRITICAL |
| Clerk middleware active on protected routes | [ ] | CRITICAL |
| Role-based access control (RBAC) enforced | [ ] | HIGH |
| Privilege escalation not possible | [ ] | CRITICAL |
| JWT tokens validated on every request | [ ] | CRITICAL |
| No hardcoded admin credentials | [ ] | CRITICAL |

### 11.3 Input Validation & Injection Prevention (OWASP A03:2021)
| Check | Status | Severity |
|-------|--------|----------|
| All inputs validated with Zod schemas | [ ] | CRITICAL |
| XSS sanitization on all user inputs | [ ] | CRITICAL |
| SQL injection prevented (parameterized queries) | [ ] | CRITICAL |
| NoSQL injection prevented | [ ] | HIGH |
| Command injection prevented | [ ] | CRITICAL |
| Path traversal prevented | [ ] | HIGH |
| Email validation strict (no header injection) | [ ] | HIGH |
| File upload type/size validation | [ ] | HIGH |
| Content-Type validation on API requests | [ ] | MEDIUM |

### 11.4 Payment Security (PCI DSS Aligned)
| Check | Status | Severity |
|-------|--------|----------|
| **Never store credit card numbers** | [ ] | CRITICAL |
| **Never store CVV/CVC codes** | [ ] | CRITICAL |
| All payments via Stripe Checkout (PCI compliant) | [ ] | CRITICAL |
| Stripe webhook signature verification | [ ] | CRITICAL |
| STRIPE_WEBHOOK_SECRET in env (not hardcoded) | [ ] | CRITICAL |
| Payment amounts validated server-side | [ ] | CRITICAL |
| Idempotency keys for payment operations | [ ] | HIGH |
| No payment data in client-side storage | [ ] | CRITICAL |
| Payment audit trail maintained | [ ] | HIGH |
| Refund operations logged and verified | [ ] | HIGH |
| Test mode keys not in production | [ ] | CRITICAL |
| Price IDs validated against Stripe | [ ] | HIGH |

### 11.5 API Security
| Check | Status | Severity |
|-------|--------|----------|
| Rate limiting on all public endpoints | [ ] | HIGH |
| Rate limiting on authentication endpoints | [ ] | CRITICAL |
| CORS whitelist (no wildcard in production) | [ ] | HIGH |
| API versioning strategy | [ ] | MEDIUM |
| Request size limits enforced | [ ] | HIGH |
| Webhook endpoints validate signatures | [ ] | CRITICAL |
| No sensitive data in error responses | [ ] | HIGH |
| API keys rotatable without downtime | [ ] | MEDIUM |

### 11.6 Security Headers
| Header | Value | Status |
|--------|-------|--------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | [ ] |
| X-Content-Type-Options | nosniff | [ ] |
| X-Frame-Options | DENY | [ ] |
| X-XSS-Protection | 1; mode=block | [ ] |
| Content-Security-Policy | Configured appropriately | [ ] |
| Referrer-Policy | strict-origin-when-cross-origin | [ ] |
| Permissions-Policy | Restrictive | [ ] |

### 11.7 Data Protection & Privacy
| Check | Status | Severity |
|-------|--------|----------|
| Sensitive data not in URL params | [ ] | CRITICAL |
| API keys not exposed client-side | [ ] | CRITICAL |
| Error messages don't leak stack traces | [ ] | HIGH |
| PII encrypted at rest (Supabase) | [ ] | HIGH |
| PII encrypted in transit (TLS 1.3) | [ ] | CRITICAL |
| Data retention policy documented | [ ] | MEDIUM |
| Right to deletion supported (GDPR) | [ ] | MEDIUM |
| Audit logs for PII access | [ ] | HIGH |
| Backup encryption enabled | [ ] | HIGH |

### 11.8 Infrastructure Security
| Check | Status | Severity |
|-------|--------|----------|
| Environment variables in Vercel secrets | [ ] | CRITICAL |
| No secrets in source control | [ ] | CRITICAL |
| Dependency vulnerability scan (npm audit) | [ ] | HIGH |
| Docker images scanned (if applicable) | [ ] | MEDIUM |
| Database connection via SSL | [ ] | CRITICAL |
| Service accounts least privilege | [ ] | HIGH |
| Vercel deployment protection | [ ] | MEDIUM |

### 11.9 Monitoring & Incident Response
| Check | Status | Severity |
|-------|--------|----------|
| Error monitoring active (e.g., Sentry) | [ ] | HIGH |
| Security event logging | [ ] | HIGH |
| Anomaly detection for payments | [ ] | HIGH |
| Failed login attempt logging | [ ] | HIGH |
| Webhook failure alerting | [ ] | HIGH |
| Incident response plan documented | [ ] | MEDIUM |
| Security contact email configured | [ ] | MEDIUM |

### 11.10 Bot & Fraud Prevention
| Check | Status | Severity |
|-------|--------|----------|
| Honeypot fields on forms | [ ] | MEDIUM |
| Form submission timing check | [ ] | MEDIUM |
| CAPTCHA on sensitive forms (if needed) | [ ] | LOW |
| Duplicate submission prevention | [ ] | HIGH |
| IP-based rate limiting | [ ] | HIGH |
| Geographic velocity checks | [ ] | MEDIUM |

---

### Security Checklist Commands
```bash
# Run before every deployment
npm audit --audit-level=high          # Check dependencies
npx tsc --noEmit                      # Type safety
grep -r "sk_live\|pk_live\|whsec_" src/  # Check for leaked keys (should return nothing)
grep -r "console.log" src/app/api/   # Check for debug logs in APIs
```

### Security Incident Severity Levels
| Level | Response Time | Examples |
|-------|--------------|----------|
| **P0 - Critical** | < 1 hour | Payment data breach, credential leak |
| **P1 - High** | < 4 hours | Auth bypass, privilege escalation |
| **P2 - Medium** | < 24 hours | XSS vulnerability, rate limit bypass |
| **P3 - Low** | < 1 week | Minor info disclosure, missing headers |

---

## 12. Database Migration Checklist

> **CRITICAL RULE:** Never deploy features that reference database tables without verifying the tables exist.

### 12.1 Pre-Deployment Database Verification
| Check | Command/Action | Status |
|-------|----------------|--------|
| Migration file exists | Check `/supabase/` or `/supabase/migrations/` | [ ] |
| Table exists in Supabase | Verify in Supabase Dashboard → Table Editor | [ ] |
| Test query works | Run `SELECT * FROM table_name LIMIT 1` in SQL Editor | [ ] |
| RLS policies applied | Check policies in Authentication → Policies | [ ] |
| Indexes created | Verify in table schema | [ ] |

### 12.2 Required Tables Registry
| Table | Purpose | Migration File | Status |
|-------|---------|----------------|--------|
| `platform_status` | Site freeze/payment due banner | `/supabase-platform-control.sql` | [ ] |
| `platform_status_log` | Audit trail for platform changes | `/supabase-platform-control.sql` | [ ] |
| `enrollments` | Waiver/enrollment data | Core schema | [ ] |
| `subscriptions` | Stripe subscription sync | Core schema | [ ] |
| `users` | User profiles | Core schema | [ ] |
| `students` | Student records | `/supabase-onboarding.sql` | [ ] |
| `parents` | Parent profiles | `/supabase-onboarding.sql` | [ ] |
| `student_locations` | Student-location assignments | `/supabase-onboarding.sql` | [ ] |
| `user_locations` | User-location access | `/supabase-schema.sql` | [ ] |
| `signed_waivers` | Signed waivers | `/supabase-waiver.sql` | [ ] |
| `locations` | Location data | Core schema | [ ] |
| `activity_logs` | Admin audit trail | `/supabase-schema.sql` | [ ] |

### 12.3 Schema-Code Sync Verification (CRITICAL)

> **This section was added after a production bug where code referenced non-existent database columns.**

#### Executable Check Commands
```bash
# 1. Find all Supabase table references in code
grep -r "\.from\(['\"]" src/app/api/ --include="*.ts" | grep -oP "from\(['\"]\\K[^'\"]+(?=['\"])"

# 2. Find all column references in insert/update operations
grep -r "\.insert\|\.update\|\.upsert" src/app/api/ --include="*.ts" -A 5

# 3. List all migration files
ls -la supabase*.sql

# 4. Verify critical columns exist in migrations
grep -l "is_active" supabase*.sql
grep -l "location_id" supabase*.sql
```

#### Critical Column Verification
| Column | Table | Migration File | Required By | Status |
|--------|-------|----------------|-------------|--------|
| `is_active` | `students` | `/supabase-verify-onboarding-tables.sql` | Student queries | [ ] |
| `location_id` | `signed_waivers` | `/supabase-add-location-to-waiver.sql` | Waiver location tracking | [ ] |
| `tshirt_size` | `students` | `/supabase-onboarding.sql` | Onboarding form | [ ] |
| `onboarding_completed` | `parents` | `/supabase-onboarding.sql` | Onboarding status | [ ] |

#### Pre-Deploy Schema Checklist
| Check | How to Verify | Status |
|-------|---------------|--------|
| All `/supabase-*.sql` files have been run in prod | Compare file list to Supabase migration history | [ ] |
| API routes only reference existing tables | Run grep check above | [ ] |
| INSERT operations only use existing columns | Run grep check above | [ ] |
| UNIQUE constraints won't block expected operations | Review constraint definitions | [ ] |
| NOT NULL constraints have defaults or are always provided | Review schema + API code | [ ] |

### 12.4 Common Database Errors
| Error Code | Meaning | Resolution |
|------------|---------|------------|
| `42P01` | Table does not exist | Run migration SQL |
| `42703` | Column does not exist | Check schema, run ALTER |
| `42501` | Permission denied | Check RLS policies |
| `23505` | Unique constraint violation | Check for duplicates |

---

## 13. Environment Variable Checklist

### Production Required
```
NEXT_PUBLIC_APP_URL=https://www.littlegrapplers.net
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_3MONTH=price_xxx
DATABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=xxx
```

---

## 13. Deployment Checklist

### Pre-Deploy
- [ ] All tests passing locally
- [ ] Build succeeds (`pnpm build`)
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied

### Post-Deploy
- [ ] Homepage loads
- [ ] Sign in/sign up works
- [ ] Dashboard accessible
- [ ] Stripe checkout works (test mode first)
- [ ] Webhooks receiving events
- [ ] Emails sending

---

## 14. Rollback Plan

If deployment fails:

1. **Immediate:** Revert to previous Vercel deployment
2. **Database:** Keep backup before migrations
3. **Stripe:** Webhooks can be disabled temporarily
4. **DNS:** No changes needed (managed by Vercel)

---

## How to Use This Document

1. **Before major releases:** Go through each section systematically
2. **Check boxes:** Mark [ ] as [x] when verified
3. **Document issues:** Note any failures with ticket numbers
4. **Reset for next release:** Clear checkboxes

```bash
# Quick reset command (find and replace in this file)
# Replace [x] with [ ]
```

---

*This document should be updated whenever new features are added.*
