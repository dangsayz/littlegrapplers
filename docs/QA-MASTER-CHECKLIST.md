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

### 9.4 Browser Compatibility
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

## 11. Security Checks

### 11.1 Authentication Security
| Check | Status |
|-------|--------|
| HTTPS enforced | [ ] |
| Secure cookies | [ ] |
| Session timeout appropriate | [ ] |
| Password requirements enforced | [ ] |

### 11.2 Authorization
| Check | Status |
|-------|--------|
| Admin routes protected | [ ] |
| Users can only access own data | [ ] |
| API endpoints validate auth | [ ] |
| Clerk middleware active | [ ] |

### 11.3 Data Protection
| Check | Status |
|-------|--------|
| Sensitive data not in URL params | [ ] |
| API keys not exposed client-side | [ ] |
| Error messages don't leak info | [ ] |
| CORS configured correctly | [ ] |

---

## 12. Environment Variable Checklist

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
