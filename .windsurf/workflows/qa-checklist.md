---
description: Run the QA Master Checklist to verify all scenarios before deployment
auto_execution_mode: 3
---

# Autonomous QA System Workflow

> **Principle:** Every failure becomes executable knowledge. Recurrence triggers deterministic action.

When this workflow is called, execute the following autonomous pipeline:

---

## PHASE 1: DETECTION

1. Read the system architecture at `/docs/QA-AUTONOMOUS-SYSTEM.md`
2. Read the checklist at `/docs/QA-MASTER-CHECKLIST.md`

3. Run **Validation Mesh** (all 5 layers):
   - **Layer 1 (Static):** Check for code patterns, type safety, security issues
   - **Layer 2 (Runtime):** Verify invariants - Stripe webhooks, subscription sync, API health
   - **Layer 3 (State):** Database consistency, cache state, session validity
   - **Layer 4 (Cross-System):** Stripe/Clerk/Supabase sync audit
   - **Layer 5 (Schema-Code Sync):** Verify database schema matches code expectations

4. **CRITICAL: Schema-Code Sync Check** (Layer 5):
   - Grep all API routes for Supabase `.from('table_name')` calls
   - Extract all table names and column references from code
   - Cross-reference against `/supabase-*.sql` migration files
   - Flag any table/column referenced in code but missing from migrations
   - Check for unapplied migrations (files exist but not run in prod)

---

## PHASE 2: PATTERN MATCHING

5. For each issue detected:
   - Generate a **fingerprint** (hash of error + context)
   - Search for matching patterns in knowledge base
   - If match found with confidence > 0.8: proceed to auto-resolution
   - If no match: queue for codification

---

## PHASE 3: RESOLUTION

6. For matched patterns:
   - Execute the deterministic resolution action
   - Log the result (success/failure)
   - Update pattern confidence score

7. For unmatched issues:
   - Capture full failure signature
   - Attempt to synthesize resolution from similar patterns
   - If 3+ similar failures exist: create new pattern rule
   - Otherwise: flag for manual review with full context

---

## PHASE 4: REPORTING

8. Generate **Autonomous QA Report**:

```
╔══════════════════════════════════════════════════════════════╗
║                    AUTONOMOUS QA REPORT                       ║
╠══════════════════════════════════════════════════════════════╣
║ Validation Mesh Status                                        ║
║ ├── Static Layer:      [PASS/FAIL] (X issues)                ║
║ ├── Runtime Layer:     [PASS/FAIL] (X issues)                ║
║ ├── State Layer:       [PASS/FAIL] (X issues)                ║
║ ├── Cross-System:      [PASS/FAIL] (X issues)                ║
║ └── Schema-Code Sync:  [PASS/FAIL] (X issues)                ║
╠══════════════════════════════════════════════════════════════╣
║ Pattern Matches: X known patterns detected                    ║
║ Auto-Resolved:   X issues fixed autonomously                  ║
║ New Patterns:    X failures codified into rules               ║
║ Pending Review:  X issues require manual attention            ║
╠══════════════════════════════════════════════════════════════╣
║ System Confidence: XX%                                        ║
║ Knowledge Base:    X patterns | X fingerprints                ║
╚══════════════════════════════════════════════════════════════╝
```

---

## PHASE 5: LEARNING

9. Update knowledge base:
   - Increment occurrence counts for matched patterns
   - Update confidence scores based on resolution success
   - Store new failure signatures
   - Create new pattern rules from recurring failures

---

## OPTIONS

When invoking `/qa-checklist`, you can specify:

- **No args:** Run full autonomous pipeline
- **`--layer=static`:** Run only static analysis
- **`--layer=runtime`:** Run only runtime invariants
- **`--layer=state`:** Run only state assertions
- **`--layer=audit`:** Run only cross-system audit
- **`--layer=schema`:** Run only schema-code sync verification
- **`--dry-run`:** Show what would be resolved without executing
- **`--pattern-scan`:** Only check for known failure patterns
- **`--report-only`:** Generate report without auto-resolution

---

## FAILURE CODIFICATION

Every failure captured must include:
- Fingerprint (deterministic hash)
- Category (auth/payment/db/api/etc)
- Severity (critical/high/medium/low)
- Full context (route, method, user, request)
- Error details (name, message, stack)
- System state at time of failure
- Resolution (if resolved)

New failures without matching patterns are automatically queued for:
1. Similar pattern search
2. Resolution synthesis
3. Rule generation (if sufficient data)
4. Manual review (if insufficient data)

---

## ANTI-HALLUCINATION CONSTRAINTS

This workflow must:
- Never guess at fixes - only execute known resolution actions
- Never skip validation layers - all 4 must run
- Never mark issues resolved without verification
- Always log actions with timestamps and results
- Cross-validate findings across layers before reporting
- Require consensus from multiple layers for critical actions
