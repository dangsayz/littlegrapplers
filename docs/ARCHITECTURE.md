# Little Grapplers Platform — Architecture Document

> **Version:** 1.0  
> **Date:** December 14, 2024  
> **Status:** Approved for Implementation

---

## Executive Summary

Little Grapplers is a membership-based platform for a youth Brazilian Jiu-Jitsu program operating across multiple daycare locations. The platform serves three distinct audiences: public visitors (marketing), administrators (operations), and registered parents (gated community access).

This document defines the information architecture, data models, user flows, component structure, and phased build plan.

---

## 1. Information Architecture

### 1.1 Site Map

```
littlegrapplers.net/
│
├── / (Home - Marketing)
├── /about
├── /programs
├── /locations
│   └── /locations/[slug]
├── /benefits
├── /faq
├── /contact
├── /register
│
├── /login
├── /forgot-password
├── /reset-password
│
├── /portal (Parent Portal - Gated)
│   ├── /portal/dashboard
│   ├── /portal/my-students
│   ├── /portal/videos
│   ├── /portal/discussions
│   ├── /portal/announcements
│   └── /portal/settings
│
└── /admin (Admin Dashboard - Protected)
    ├── /admin/dashboard
    ├── /admin/parents
    │   └── /admin/parents/[id]
    ├── /admin/students
    │   └── /admin/students/[id]
    ├── /admin/locations
    │   └── /admin/locations/[id]
    ├── /admin/programs
    │   └── /admin/programs/[id]
    ├── /admin/memberships
    ├── /admin/videos
    ├── /admin/discussions
    ├── /admin/announcements
    ├── /admin/content
    └── /admin/settings
```

### 1.2 Content Hierarchy

| Level | Entity | Description |
|-------|--------|-------------|
| 1 | **Organization** | Little Grapplers (single tenant) |
| 2 | **Location** | Daycare partner facility |
| 3 | **Program** | BJJ program at a location (can have multiple per location) |
| 4 | **Parent** | Registered user with login |
| 5 | **Student** | Child entity (no login, belongs to parent) |
| 6 | **Membership** | Enrollment record linking Student → Program |

---

## 2. Data Models & Relationships

### 2.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Location  │──1:N──│   Program   │──1:N──│ Membership  │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                   │
                                                   │ N:1
                                                   │
┌─────────────┐       ┌─────────────┐       ┌──────▼──────┐
│    User     │──1:N──│   Parent    │──1:N──│   Student   │
│  (Auth)     │       │  (Profile)  │       └─────────────┘
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Video    │       │ Discussion  │       │Announcement │
│  (scoped)   │       │   Thread    │       │  (scoped)   │
└─────────────┘       └─────────────┘       └─────────────┘
```

### 2.2 Schema Definitions

#### Users (Authentication)
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique, indexed
  passwordHash: string;          // bcrypt
  role: 'admin' | 'parent';
  emailVerified: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
  lastLoginAt: DateTime | null;
}
```

#### Parents (Profile)
```typescript
interface Parent {
  id: string;                    // UUID
  userId: string;                // FK → User
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Students
```typescript
interface Student {
  id: string;                    // UUID
  parentId: string;              // FK → Parent
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  avatarUrl: string | null;
  beltRank: BeltRank;
  stripes: number;               // 0-4
  notes: string | null;          // Admin-only notes
  createdAt: DateTime;
  updatedAt: DateTime;
}

type BeltRank = 'white' | 'grey-white' | 'grey' | 'grey-black' | 
                'yellow-white' | 'yellow' | 'yellow-black' |
                'orange-white' | 'orange' | 'orange-black' |
                'green-white' | 'green' | 'green-black';
```

#### Locations
```typescript
interface Location {
  id: string;                    // UUID
  name: string;                  // e.g., "Sunshine Daycare"
  slug: string;                  // URL-safe, unique
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  description: string | null;    // Rich text
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Programs
```typescript
interface Program {
  id: string;                    // UUID
  locationId: string;            // FK → Location
  name: string;                  // e.g., "Tiny Grapplers (3-5)"
  slug: string;                  // Unique within location
  description: string | null;
  ageMin: number;                // Minimum age in years
  ageMax: number;                // Maximum age in years
  schedule: ScheduleEntry[];     // JSON array
  monthlyPrice: number;          // In cents
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface ScheduleEntry {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  startTime: string;             // "09:00"
  endTime: string;               // "09:45"
}
```

#### Memberships
```typescript
interface Membership {
  id: string;                    // UUID
  studentId: string;             // FK → Student
  programId: string;             // FK → Program
  status: 'active' | 'paused' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date | null;
  contractSignedAt: DateTime | null;
  monthlyRate: number;           // In cents (snapshot at enrollment)
  notes: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Videos (Technique Library)
```typescript
interface Video {
  id: string;                    // UUID
  title: string;
  description: string | null;
  videoUrl: string;              // External embed or file URL
  thumbnailUrl: string | null;
  duration: number | null;       // Seconds
  category: string;              // e.g., "Fundamentals", "Self-Defense"
  programIds: string[];          // Scoped to programs (empty = all)
  isPublic: boolean;             // Show on marketing site?
  sortOrder: number;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Discussions
```typescript
interface DiscussionThread {
  id: string;                    // UUID
  programId: string | null;      // FK → Program (null = all programs)
  authorId: string;              // FK → User
  title: string;
  content: string;               // Rich text
  isPinned: boolean;
  isLocked: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface DiscussionReply {
  id: string;                    // UUID
  threadId: string;              // FK → DiscussionThread
  authorId: string;              // FK → User
  content: string;               // Rich text
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Announcements
```typescript
interface Announcement {
  id: string;                    // UUID
  programIds: string[];          // Scoped (empty = all)
  title: string;
  content: string;               // Rich text
  type: 'general' | 'student-of-month' | 'event' | 'schedule-change';
  studentOfMonthId: string | null;  // FK → Student (if type = student-of-month)
  publishAt: DateTime;
  expiresAt: DateTime | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

---

## 3. User Flows

### 3.1 Parent Registration Flow

```
[Landing Page]
       │
       ▼
[Register Button] ─────────────────────────────────┐
       │                                           │
       ▼                                           │
[Select Location] ──── Location cards with         │
       │               programs listed             │
       ▼                                           │
[Select Program] ───── Age-appropriate filtering   │
       │                                           │
       ▼                                           │
[Parent Info Form]                                 │
  • First name                                     │
  • Last name                                      │
  • Email                                          │
  • Phone                                          │
  • Password                                       │
       │                                           │
       ▼                                           │
[Student Info Form]                                │
  • First name                                     │
  • Last name                                      │
  • Date of birth                                  │
  • (Optional: Add another student)               │
       │                                           │
       ▼                                           │
[Review & Confirm]                                 │
       │                                           │
       ▼                                           │
[Email Verification] ◄─────────────────────────────┘
       │
       ▼
[Portal Dashboard] ─── Welcome state with next steps
```

### 3.2 Parent Portal Flow

```
[Login]
   │
   ▼
[Dashboard]
   ├── Quick stats (students, upcoming events)
   ├── Recent announcements
   └── Action cards
         │
         ├── [My Students] ──── View progress, belt rank
         │
         ├── [Videos] ──── Filtered by enrolled programs
         │
         ├── [Discussions] ──── Program-scoped threads
         │
         ├── [Announcements] ──── All relevant updates
         │
         └── [Settings] ──── Profile, password, notifications
```

### 3.3 Admin Flow

```
[Admin Login]
     │
     ▼
[Dashboard]
  ├── KPIs: Active students, MRR, locations, programs
  ├── Recent activity feed
  └── Quick actions
        │
        ├── [Parents] ──── Full CRUD, search, filter
        │     └── [Parent Detail] ──── Edit, view students
        │
        ├── [Students] ──── Full CRUD, belt management
        │     └── [Student Detail] ──── Edit, view memberships
        │
        ├── [Locations] ──── Full CRUD
        │     └── [Location Detail] ──── Edit, manage programs
        │
        ├── [Programs] ──── Full CRUD, schedule management
        │
        ├── [Memberships] ──── Status management, financials
        │
        ├── [Videos] ──── Upload, organize, scope
        │
        ├── [Discussions] ──── Moderate, pin, lock
        │
        ├── [Announcements] ──── Create, schedule, target
        │
        ├── [Content] ──── Edit marketing page content
        │
        └── [Settings] ──── Site config, user management
```

---

## 4. Component Architecture

### 4.1 Design System Components

```
components/
├── ui/                          # Primitives (shadcn/ui based)
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── switch.tsx
│   ├── slider.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── dropdown-menu.tsx
│   ├── popover.tsx
│   ├── tooltip.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── table.tsx
│   ├── form.tsx
│   └── toast.tsx
│
├── layout/                      # Structural components
│   ├── header.tsx               # Marketing header
│   ├── footer.tsx               # Marketing footer
│   ├── mobile-nav.tsx           # Slide-out navigation
│   ├── admin-sidebar.tsx        # Admin navigation
│   ├── portal-sidebar.tsx       # Parent portal navigation
│   ├── page-header.tsx          # Title + breadcrumbs
│   └── container.tsx            # Max-width wrapper
│
├── marketing/                   # Public-facing components
│   ├── hero.tsx                 # Homepage hero
│   ├── feature-grid.tsx         # Benefits/features layout
│   ├── location-card.tsx        # Daycare partner card
│   ├── testimonial-carousel.tsx # Social proof
│   ├── cta-section.tsx          # Call-to-action blocks
│   ├── faq-accordion.tsx        # Collapsible FAQ
│   └── contact-form.tsx         # Contact/inquiry form
│
├── portal/                      # Parent portal components
│   ├── student-card.tsx         # Student overview card
│   ├── belt-display.tsx         # Visual belt + stripes
│   ├── video-card.tsx           # Video thumbnail + info
│   ├── video-player.tsx         # Embedded player
│   ├── discussion-thread.tsx    # Thread view
│   ├── discussion-reply.tsx     # Reply component
│   ├── announcement-card.tsx    # Announcement display
│   └── dashboard-stat.tsx       # Stat card
│
├── admin/                       # Admin dashboard components
│   ├── data-table.tsx           # Sortable, filterable table
│   ├── stat-card.tsx            # KPI display
│   ├── activity-feed.tsx        # Recent actions
│   ├── entity-form.tsx          # CRUD form wrapper
│   ├── rich-text-editor.tsx     # Content editing
│   ├── image-upload.tsx         # File upload
│   ├── schedule-builder.tsx     # Program schedule UI
│   └── membership-status.tsx    # Status badge + actions
│
└── shared/                      # Cross-cutting components
    ├── logo.tsx                 # Brand logo
    ├── icon.tsx                 # Lucide wrapper
    ├── loading-spinner.tsx      # Loading states
    ├── empty-state.tsx          # No data display
    ├── error-boundary.tsx       # Error handling
    ├── confirm-dialog.tsx       # Destructive action confirm
    └── date-picker.tsx          # Date selection
```

### 4.2 Page Structure

```
app/
├── (marketing)/                 # Public pages (shared layout)
│   ├── layout.tsx
│   ├── page.tsx                 # Home
│   ├── about/page.tsx
│   ├── programs/page.tsx
│   ├── locations/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── benefits/page.tsx
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   └── register/
│       ├── page.tsx
│       └── success/page.tsx
│
├── (auth)/                      # Auth pages
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── portal/                      # Parent portal (protected)
│   ├── layout.tsx
│   ├── page.tsx                 # Dashboard
│   ├── my-students/page.tsx
│   ├── videos/page.tsx
│   ├── discussions/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── announcements/page.tsx
│   └── settings/page.tsx
│
├── admin/                       # Admin dashboard (protected)
│   ├── layout.tsx
│   ├── page.tsx                 # Dashboard
│   ├── parents/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── students/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── locations/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── programs/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── memberships/page.tsx
│   ├── videos/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── discussions/page.tsx
│   ├── announcements/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── content/page.tsx
│   └── settings/page.tsx
│
└── api/                         # API routes
    ├── auth/
    │   ├── login/route.ts
    │   ├── logout/route.ts
    │   ├── register/route.ts
    │   ├── verify-email/route.ts
    │   ├── forgot-password/route.ts
    │   └── reset-password/route.ts
    ├── parents/route.ts
    ├── students/route.ts
    ├── locations/route.ts
    ├── programs/route.ts
    ├── memberships/route.ts
    ├── videos/route.ts
    ├── discussions/route.ts
    ├── announcements/route.ts
    └── upload/route.ts
```

---

## 5. Technical Stack

### 5.1 Core Technologies

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Full-stack, RSC, excellent DX |
| **Language** | TypeScript | Type safety, better tooling |
| **Styling** | Tailwind CSS | Utility-first, consistent design |
| **Components** | shadcn/ui | Accessible, customizable primitives |
| **Icons** | Lucide React | Vector, tree-shakeable, consistent |
| **Database** | PostgreSQL | Relational data, proven reliability |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Auth** | NextAuth.js v5 | Flexible, well-maintained |
| **Validation** | Zod | Runtime + static type validation |
| **Forms** | React Hook Form | Performance, DX |
| **State** | Zustand | Lightweight, simple |
| **Email** | Resend | Modern API, good DX |
| **Storage** | Cloudflare R2 | Cost-effective, S3-compatible |
| **Hosting** | Vercel | Native Next.js support |

### 5.2 Development Tools

- **ESLint** + **Prettier** — Code quality
- **Husky** + **lint-staged** — Pre-commit hooks
- **Vitest** — Unit testing
- **Playwright** — E2E testing

---

## 6. Security Architecture

### 6.1 Authentication

- **Session-based** via NextAuth.js with JWT strategy
- **Password hashing** with bcrypt (cost factor 12)
- **Email verification** required before portal access
- **Rate limiting** on auth endpoints (10 req/min/IP)

### 6.2 Authorization

```typescript
// Role-based access control
const PERMISSIONS = {
  admin: ['*'],  // Full access
  parent: [
    'portal:read',
    'portal:profile:write',
    'portal:discussions:write',
    'portal:students:read',  // Own students only
  ],
} as const;
```

### 6.3 Data Protection

- **Row-level security** enforced at query level
- Parents can only access their own students/memberships
- Program-scoped content filtered by active memberships
- Sensitive fields (SSN, payment info) encrypted at rest

---

## 7. Phased Build Plan

### Phase 1: Foundation (MVP) — 3 weeks

**Goal:** Core platform with registration, basic portal, and admin.

#### Week 1: Infrastructure & Marketing
- [x] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Database schema + Prisma setup
- [ ] Authentication system (NextAuth.js)
- [ ] Marketing pages (Home, About, Programs, Locations, FAQ)
- [ ] Responsive header/footer with mobile nav
- [ ] Contact form

#### Week 2: Registration & Parent Portal
- [ ] Registration flow (multi-step form)
- [ ] Email verification
- [ ] Parent portal layout + navigation
- [ ] Dashboard (basic stats)
- [ ] My Students page
- [ ] Settings (profile, password)

#### Week 3: Admin Foundation
- [ ] Admin layout + navigation
- [ ] Admin dashboard (KPIs)
- [ ] Parents CRUD
- [ ] Students CRUD (with belt management)
- [ ] Locations CRUD
- [ ] Programs CRUD
- [ ] Memberships management

**MVP Deliverables:**
- Functional marketing site
- Parent registration + portal access
- Admin can manage all core entities

---

### Phase 2: Content & Community — 2 weeks

**Goal:** Enable content delivery and community features.

#### Week 4: Content System
- [ ] Video library (admin upload)
- [ ] Video player in portal
- [ ] Program-scoped video access
- [ ] Announcements system
- [ ] Student of the Month feature

#### Week 5: Discussions & Polish
- [ ] Discussion threads (CRUD)
- [ ] Discussion replies
- [ ] Admin moderation tools
- [ ] Email notifications (welcome, announcements)
- [ ] Performance optimization
- [ ] Error handling + edge cases

**Phase 2 Deliverables:**
- Complete content management
- Community discussion feature
- Email notification system

---

### Phase 3: Advanced Features — 2 weeks

**Goal:** Operational excellence and polish.

#### Week 6: Financial & Reporting
- [ ] Financial overview dashboard
- [ ] Membership revenue tracking
- [ ] Export reports (CSV)
- [ ] Admin activity logging
- [ ] Bulk operations (students, memberships)

#### Week 7: CMS & UX Polish
- [ ] Marketing content CMS (editable sections)
- [ ] Advanced search + filters
- [ ] Micro-interactions + animations
- [ ] Accessibility audit + fixes
- [ ] Performance audit (Core Web Vitals)
- [ ] Mobile experience polish

---

### Phase 4: Scale & Optimize — Future

- **Payment integration** (Stripe) — Automated billing
- **Scheduling system** — Class check-ins, attendance
- **Mobile app** (React Native) — Native experience
- **Multi-tenant architecture** — Franchise support
- **Advanced analytics** — Retention, engagement
- **API for integrations** — Third-party services

---

## 8. Assumptions & Tradeoffs

### Assumptions

1. **Single-tenant for MVP** — One organization (Little Grapplers). Multi-tenant architecture deferred to Phase 4.

2. **Manual payments initially** — No automated billing in MVP. Parents pay via existing channels; admin tracks manually.

3. **External video hosting** — Videos hosted on YouTube/Vimeo (unlisted). Platform embeds only. R2 for thumbnails.

4. **Email as primary contact** — SMS notifications out of scope for MVP.

5. **English only** — Internationalization not required initially.

### Tradeoffs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Next.js App Router | Newer, less ecosystem maturity | Better architecture, RSC benefits |
| PostgreSQL over SQLite | More ops overhead | Better for production scale |
| shadcn/ui over full component lib | More initial setup | Full control, no vendor lock-in |
| JWT sessions | Can't revoke instantly | Simpler infra, short TTL mitigates |
| Prisma over raw SQL | Some query limitations | DX, type safety, migrations |

### Constraints

1. **No SSN/sensitive PII storage** — Birth dates stored, but no government IDs.

2. **COPPA compliance** — Students are minors; all data access through parent accounts only.

3. **File upload limits** — 10MB per image, 100MB per video (if self-hosted in future).

---

## 9. Success Metrics

### Technical
- **Lighthouse score** > 90 (mobile)
- **Core Web Vitals** all green
- **Time to first byte** < 200ms
- **Zero critical accessibility issues**

### Business (to track post-launch)
- Registration completion rate
- Portal engagement (videos watched, discussions)
- Admin time saved vs. previous system
- Parent satisfaction (NPS)

---

## 10. Open Questions

1. **Belt promotion workflow** — Does admin promote manually, or is there a formal testing/graduation process to track?

2. **Contract/waiver handling** — Digital signatures required? Third-party integration (DocuSign)?

3. **Photo release management** — Track opt-in/out for student photos in marketing?

4. **Program pricing tiers** — Single price per program, or sibling/multi-program discounts?

5. **Instructor management** — Are instructors tracked as a separate entity, or just admin notes?

---

*Document maintained by the development team. Last updated: December 14, 2024.*
