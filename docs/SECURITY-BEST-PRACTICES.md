# Security Best Practices

> **Little Grapplers Payment Security Documentation**  
> Standards: PCI DSS Level 4, OWASP Top 10 2021, SOC 2 Type II aligned  
> Last Updated: January 2026

---

## Executive Summary

This document outlines the security controls implemented to protect customer payment data and personal information. Little Grapplers processes payments through **Stripe**, a PCI DSS Level 1 certified payment processor, ensuring the highest level of payment security compliance.

---

## 1. Payment Security Architecture

### 1.1 How We Handle Payments (PCI DSS Compliant)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PAYMENT FLOW (SECURE)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Customer → [Our Site] → [Stripe Checkout] → [Stripe Servers]           │
│                              ↓                      ↓                    │
│                         Card Entry            Card Processing            │
│                         (Stripe UI)           (PCI Level 1)              │
│                              ↓                      ↓                    │
│                         [Webhook] ←──────────── [Result]                 │
│                              ↓                                           │
│                      [Our Database]                                      │
│                   (No card data stored)                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 What We NEVER Store
- ❌ Credit card numbers (full or partial)
- ❌ CVV/CVC security codes
- ❌ Card expiration dates
- ❌ Magnetic stripe data
- ❌ PIN numbers

### 1.3 What We DO Store (Safe)
- ✅ Stripe Customer ID (cus_xxx)
- ✅ Stripe Subscription ID (sub_xxx)
- ✅ Payment Intent ID (pi_xxx)
- ✅ Transaction amounts and dates
- ✅ Payment status (succeeded/failed/refunded)

---

## 2. Authentication Security (Clerk)

### 2.1 Authentication Features
| Feature | Implementation | Status |
|---------|---------------|--------|
| Password Requirements | Min 8 chars, complexity enforced | ✅ Active |
| Brute Force Protection | Rate limiting after failed attempts | ✅ Active |
| Session Management | Secure cookies, 30-day expiry | ✅ Active |
| OAuth Providers | Google, Apple (optional) | ✅ Available |
| Email Verification | Required for new accounts | ✅ Active |
| Password Reset | Time-limited tokens via email | ✅ Active |

### 2.2 Session Security
```typescript
// Clerk handles all session security automatically
// Sessions use:
// - HttpOnly cookies (no JS access)
// - Secure flag (HTTPS only)
// - SameSite=Lax (CSRF protection)
// - Rolling expiration
```

---

## 3. Input Validation & Sanitization

### 3.1 All User Inputs Are Validated

**Location:** `/src/lib/validation.ts`

```typescript
// Every form field is validated with Zod schemas
// Example protections:
sanitizeString(input)  // Removes HTML tags, escapes entities
formatPhoneNumber()    // Strict format enforcement
emailSchema           // RFC-compliant email validation
```

### 3.2 Injection Prevention
| Attack Type | Protection | Implementation |
|-------------|------------|----------------|
| XSS | HTML entity encoding | `sanitizeString()` |
| SQL Injection | Parameterized queries | Supabase client |
| NoSQL Injection | Schema validation | Zod schemas |
| Header Injection | Email validation | Strict regex |
| Path Traversal | UUID validation | `uuidSchema` |

---

## 4. API Security

### 4.1 Rate Limiting

**Location:** `/src/lib/validation.ts`

| Endpoint | Limit | Window |
|----------|-------|--------|
| Contact Form | 3 requests | 60 seconds |
| Newsletter | 3 requests | 60 seconds |
| Waiver/Enrollment | 5 requests | 60 seconds |
| Discussion Posts | 5 requests | 60 seconds |
| Replies | 3 requests | 30 seconds |
| Default | 10 requests | 60 seconds |

### 4.2 Webhook Security

**Location:** `/src/app/api/payments/webhook/route.ts`

```typescript
// Stripe webhook signature verification
const event = constructWebhookEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET  // Never hardcoded
);
```

### 4.3 Bot Prevention
- Honeypot fields on all public forms
- Submission timing checks (too fast = bot)
- IP-based rate limiting
- Duplicate submission prevention

---

## 5. Security Headers

**Location:** `/next.config.js`

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| X-Frame-Options | SAMEORIGIN | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS filter |
| Referrer-Policy | strict-origin | Limit referrer leakage |
| Permissions-Policy | camera=(), etc. | Disable unnecessary APIs |

---

## 6. Data Protection

### 6.1 Encryption
| Data State | Encryption | Provider |
|------------|------------|----------|
| In Transit | TLS 1.3 | Vercel/Supabase |
| At Rest | AES-256 | Supabase |
| Backups | AES-256 | Supabase |

### 6.2 Personal Information Handling
- All PII stored in Supabase (encrypted at rest)
- Access logged in activity_logs table
- No PII in URL parameters
- Error messages don't expose sensitive data

### 6.3 Data Minimization
- Only collect necessary information
- Digital signatures stored (legal requirement)
- IP addresses logged for waiver validity
- No excessive data retention

---

## 7. Access Control

### 7.1 Role-Based Access Control (RBAC)

**Location:** `/src/lib/admin-roles.ts`

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access |
| Admin | Enrollments, students, announcements |
| Parent/Client | Own data only |
| Public | Public pages only |

### 7.2 Protected Routes
```typescript
// Middleware checks on every request
// /dashboard/* - Requires authentication
// /dashboard/admin/* - Requires admin role
// /api/* - Auth validated per endpoint
```

---

## 8. Incident Response

### 8.1 Severity Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| P0 Critical | < 1 hour | Payment breach, credential leak |
| P1 High | < 4 hours | Auth bypass, privilege escalation |
| P2 Medium | < 24 hours | XSS, rate limit bypass |
| P3 Low | < 1 week | Info disclosure, missing headers |

### 8.2 Response Steps

1. **Detect** - Monitor alerts, user reports
2. **Contain** - Disable affected features if needed
3. **Eradicate** - Fix vulnerability
4. **Recover** - Restore normal operation
5. **Learn** - Post-incident review, update docs

### 8.3 Contact
- Security issues: info@littlegrapplers.net
- Stripe support: dashboard.stripe.com

---

## 9. Compliance Checklist

### PCI DSS Self-Assessment (SAQ-A)
- [x] Card data handled entirely by Stripe
- [x] No card data stored on our servers
- [x] HTTPS enforced site-wide
- [x] Webhook signatures verified
- [x] Access to Stripe dashboard restricted

### OWASP Top 10 (2021)
- [x] A01 - Broken Access Control: RBAC implemented
- [x] A02 - Cryptographic Failures: TLS 1.3, no sensitive data exposure
- [x] A03 - Injection: Zod validation, parameterized queries
- [x] A04 - Insecure Design: Security headers, CSP
- [x] A05 - Security Misconfiguration: Env vars in secrets
- [x] A06 - Vulnerable Components: npm audit in CI
- [x] A07 - Auth Failures: Clerk handles auth securely
- [x] A08 - Data Integrity: Webhook signatures
- [x] A09 - Logging: Activity logs, error tracking
- [x] A10 - SSRF: No user-controlled URLs in backend

---

## 10. Development Guidelines

### DO
- Use Zod schemas for ALL user input
- Validate on both client AND server
- Use parameterized database queries
- Log security-relevant events
- Keep dependencies updated
- Run `npm audit` before deploys

### DON'T
- Store sensitive data in localStorage
- Log full request bodies (may contain PII)
- Expose stack traces in production
- Use `dangerouslySetInnerHTML`
- Disable HTTPS in any environment
- Hardcode secrets in source code

---

## 11. Security Testing

### Pre-Deployment Checks
```bash
# 1. Dependency vulnerabilities
npm audit --audit-level=high

# 2. Check for leaked secrets
grep -r "sk_live\|pk_live\|whsec_" src/

# 3. TypeScript type safety
npx tsc --noEmit

# 4. Check for debug logs in APIs
grep -r "console.log" src/app/api/
```

### Periodic Reviews
- [ ] Monthly: npm audit
- [ ] Monthly: Review admin access list
- [ ] Quarterly: Full security checklist review
- [ ] Annually: Third-party penetration test (recommended)

---

## 12. Third-Party Security

| Service | Security Standard | Our Responsibility |
|---------|------------------|-------------------|
| Stripe | PCI DSS Level 1 | Webhook verification |
| Clerk | SOC 2 Type II | Secure configuration |
| Supabase | SOC 2 Type II | RLS policies |
| Vercel | SOC 2 Type II | Env var management |
| Resend | SOC 2 Type II | API key security |

---

*This document should be reviewed quarterly and updated when security practices change.*
