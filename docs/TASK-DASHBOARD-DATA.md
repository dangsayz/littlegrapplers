# Task: Dashboard Real Data Integration

> **Status:** Pending  
> **Priority:** High  
> **Estimated Effort:** 2-3 hours

---

## Overview

Connect the parent dashboard to real database data instead of mock arrays. Fetch students, memberships, discussions, and billing info.

---

## Requirements

### Data Fetching
- [ ] Get current user from Clerk
- [ ] Fetch user's students from database
- [ ] Fetch active memberships
- [ ] Fetch recent discussions for user's locations
- [ ] Fetch announcements for user's locations

### Dashboard Components Update
- [ ] StudentCard with real data
- [ ] MembershipCard with real data  
- [ ] DiscussionPreview with real threads
- [ ] BillingPlaceholder with real status

### Database Queries
- [ ] `getUserByClerkId(clerkId)`
- [ ] `getStudentsByUserId(userId)`
- [ ] `getMembershipsByUserId(userId)`
- [ ] `getThreadsByLocationIds(locationIds)`
- [ ] `getAnnouncementsByLocationIds(locationIds)`

---

## Implementation

### Server Component Data Fetching
```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const { userId } = await auth();
  
  const user = await getUserByClerkId(userId);
  const students = await getStudentsByUserId(user.id);
  const memberships = await getMembershipsByUserId(user.id);
  const threads = await getRecentThreads(user.locationIds);
  
  return <DashboardContent {...data} />;
}
```

### Database Functions (`src/lib/db/queries.ts`)
```typescript
export async function getUserByClerkId(clerkId: string)
export async function getStudentsByUserId(userId: string)
export async function getMembershipsByUserId(userId: string)
export async function getUserLocations(userId: string)
```

---

## Schema Requirements

Ensure these tables exist and are populated:
- [x] `users` - with clerk_user_id
- [ ] `students` - linked to users
- [ ] `memberships` - linking students to programs
- [ ] `user_locations` - user's location access

---

## Acceptance Criteria

- [ ] Dashboard shows real user data
- [ ] Empty states display when no data
- [ ] Loading states during fetch
- [ ] Error handling for failed queries
- [ ] Data properly scoped to current user

---

*Created: December 2024*
