# Task: Email System Integration

> **Status:** Pending  
> **Priority:** Medium  
> **Estimated Effort:** 2-3 hours

---

## Overview

Wire up the email sending functionality using Resend. Templates exist in the database, this task connects them to actual email delivery.

---

## Requirements

### Email Provider Setup
- [ ] Configure Resend API key in environment
- [ ] Create email utility functions
- [ ] Test email sending

### Transactional Emails
- [ ] Welcome email on registration/onboarding completion
- [ ] PIN update notification
- [ ] Password reset (if not handled by Clerk)

### Email Templates
- [x] Templates exist in database (welcome, announcement, pin-updated)
- [ ] Template variable substitution function
- [ ] HTML email rendering

### Admin Features
- [ ] Send test email button
- [ ] View email logs
- [ ] Email campaign creation (future)

---

## Implementation

### Email Utility (`src/lib/email.ts`)
```typescript
interface SendEmailParams {
  to: string;
  templateSlug: string;
  variables: Record<string, string>;
}

async function sendEmail(params: SendEmailParams): Promise<void>
async function sendWelcomeEmail(email: string, firstName: string, locationName: string): Promise<void>
async function sendPinUpdateEmail(email: string, firstName: string, locationName: string, pin: string): Promise<void>
```

### Environment Variables
```
RESEND_API_KEY=re_xxxxx
EMAIL_FROM_ADDRESS=hello@littlegrapplers.com
EMAIL_FROM_NAME=Little Grapplers
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send` | Send email (internal/admin) |
| GET | `/api/admin/email/logs` | View email logs |
| POST | `/api/admin/email/test` | Send test email |

---

## Integration Points

1. **Onboarding completion** → Send welcome email
2. **PIN update (admin)** → Send PIN notification
3. **Announcement publish** → Send announcement email (optional)

---

## Acceptance Criteria

- [ ] Welcome email sends on onboarding completion
- [ ] PIN update emails work from admin
- [ ] Email logs recorded in database
- [ ] Template variables properly substituted
- [ ] Error handling for failed sends

---

*Created: December 2024*
