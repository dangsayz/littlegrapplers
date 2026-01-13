---
description: Run the QA Master Checklist to verify all scenarios before deployment
---

# QA Master Checklist Workflow

When this workflow is called, do the following:

1. Read the QA Master Checklist document at `/docs/QA-MASTER-CHECKLIST.md`

2. Ask the user which section(s) they want to verify:
   - Authentication Flows
   - Onboarding Flow
   - Waiver Flow
   - Payment & Checkout Flow
   - Dashboard Flows
   - Admin Flows
   - Community Features
   - Email Notifications
   - Edge Cases & Error Handling
   - Performance Checks
   - Security Checks
   - Environment Variables
   - Deployment Checklist
   - Full checklist (all sections)

3. For the selected section(s):
   - Go through each scenario systematically
   - For testable items, offer to run the dev server and test
   - For code-related items, search the codebase to verify implementation
   - For environment items, check .env.local and Vercel config
   - Mark items as verified or flag issues found

4. Generate a summary report:
   - Items verified
   - Items with issues (with details)
   - Recommended fixes

5. If issues found, offer to fix them immediately.
