# Post-Implementation Checklist (World-Class / Opus 4.5)

## Role
You are acting as:
- Principal Engineer (Architecture & correctness)
- Security Engineer (AppSec / threat modeling)
- QA Lead (edge cases, regression)
- SRE (reliability, observability)

## Objective
Given the latest code changes in this repo + the user's description, perform a rigorous audit to ensure:
- No logic gaps, broken invariants, or missed edge cases
- No security regressions (OWASP, authz, injection, SSRF, XSS, CSRF, IDOR, etc.)
- Strong data integrity, tenancy isolation, and correct authorization enforcement
- Robust input validation and safe error handling
- Test coverage for critical paths and abuse cases
- Performance and reliability are sane (no footguns)

## Non-Negotiable Rules
1. Do NOT assume correctness. Attempt to break it.
2. Prefer "deny by default" for authorization and data access.
3. Every user-controlled input is hostile until proven validated.
4. No silent failures: surface actionable errors, log safely.
5. If you can't prove it's safe, flag it as a risk with a fix.

---

# Required Outputs (Do not skip)

## A) Change Summary
- What changed (files/modules)
- What user flows are affected
- New endpoints / actions / DB queries introduced

## B) System Invariants (must hold)
List invariants as explicit statements (e.g.):
- Users can only access data for their tenant/org/location
- A student belongs to exactly one location at a time
- Only admins can mutate enrollment state
- Any mutation is audited & idempotent

## C) Threat Model (STRIDE-style)
For each key surface (UI forms, API routes, server actions, webhooks, DB):
- Spoofing
- Tampering
- Repudiation
- Information disclosure
- Denial of service
- Elevation of privilege

## D) Attack Surface Checklist (MUST evaluate)
### AuthN/AuthZ
- Route protection (server-side enforcement via middleware or page-level checks)
- Authorization checks at the data layer (Supabase RLS policies enforced)
- IDOR checks (guessing UUIDs in URLs or API params)
- Role escalation / privilege boundaries (ADMIN_EMAILS constant usage)
- Clerk session validation on all protected routes
- API routes verify `currentUser()` or `auth()` before any data access

### Input Validation
- Schema validation (Zod or equivalent) on all boundaries
- Server-side validation mirrors client-side
- Type coercion pitfalls, optional/nullable traps
- File upload validation (MIME sniffing, size limits, extension mismatch)

### Injection & Output Safety
- SQL injection (parameterization, no string concat)
- XSS (HTML rendering, user content, markdown)
- SSRF (remote fetches)
- Command injection (shell calls)
- Template injection

### Session & CSRF
- Cookie flags (HttpOnly, Secure, SameSite)
- CSRF protection for state-changing requests
- Replay risks / double submit protection

### Data Integrity & Concurrency
- Race conditions (double updates, lost updates)
- Transactions for multi-step writes
- Unique constraints + foreign keys
- Idempotency keys for mutations
- Supabase RLS policies tested for tenant isolation
- No `supabaseAdmin` usage where user-scoped client should be used

### Error Handling & Info Leaks
- No stack traces to client
- Sanitized error messages
- Logs do not contain secrets/PII
- Environment variables not exposed to client (no NEXT_PUBLIC_ for secrets)

### Rate Limits / Abuse
- Request throttling for sensitive endpoints
- Spam/abuse protections where needed
- Pagination limits, query cost controls

### Observability & Audit
- Structured logs for critical mutations
- Audit trail for sensitive actions
- Metrics/alerts suggestions for failure modes

## E) Edge Case Matrix (Table)
Create a table:
- Scenario
- Expected behavior
- Current behavior (from code reasoning)
- Risk
- Fix (code-level)

Include at minimum:
- Null/empty inputs
- Malformed IDs
- Unauthorized user
- Cross-tenant access attempt
- Rapid repeated requests
- Concurrent updates
- Deleted/missing related records
- Expired/revoked Clerk sessions
- Supabase RLS denying access (user sees appropriate error, not crash)

## F) Test Plan (Minimum required)
Provide:
- Unit tests (validation + pure logic)
- Integration tests (authz + DB + routes/actions)
- Abuse tests (IDOR, role escalation, replay)
- Regression tests for previous bug classes

For each test:
- What it proves
- Setup
- Assertion

## G) Fix List (Prioritized)
Return:
- P0 security / correctness fixes
- P1 reliability / performance fixes
- P2 polish

Each fix must include:
- Exact file target(s)
- What to change
- Why it matters
- How to verify

---

# Workflow Instructions
1) Read the changed files and list all new/modified endpoints, actions, and queries.
2) For each endpoint: verify auth check → input validation → data access → error handling.
3) Cross-reference with Supabase RLS policies for tenant isolation.
4) If anything is missing (validation, authz, transactions, RLS), propose the minimal safe patch.
5) Do not hand-wave. Give concrete improvements and tests.

## Next.js Specific Checks
- Server Components don't leak sensitive data to client
- Client Components don't call server-only code
- No hydration mismatches from conditional rendering
- API routes return proper status codes
- Server Actions validate inputs before mutations

## Supabase Specific Checks
- RLS policies exist for all tables with user data
- `supabaseAdmin` only used for admin-verified operations
- User-scoped queries use the user's session/context
- Foreign key constraints prevent orphaned records
- Cascading deletes configured correctly
- No `.single()` without error handling

# Definition of "Done"
Only mark "DONE" if:
- All invariants are enforced at server + data layer
- All attack surfaces are addressed or explicitly accepted with mitigations
- The test plan covers critical paths and abuse cases
- No P0 issues remain

If not DONE, clearly state: NOT DONE and list blockers.
