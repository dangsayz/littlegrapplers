# Task: Announcements System

> **Status:** Pending  
> **Priority:** High  
> **Estimated Effort:** 3-4 hours

---

## Overview

Build an announcements system for admins to communicate with parents. Includes general announcements, schedule changes, events, and Student of the Month features.

---

## Requirements

### Database Schema
- [ ] `announcements` table with: id, title, content, type, location_ids, student_of_month_id, publish_at, expires_at, created_by, created_at, updated_at
- [ ] Types: general, student-of-month, event, schedule-change

### Admin Features
- [ ] Announcements list with status filters (draft, scheduled, published, expired)
- [ ] Create announcement form
- [ ] Rich text editor for content
- [ ] Location targeting (all or specific)
- [ ] Schedule for future publish
- [ ] Student of the Month picker
- [ ] Edit/delete announcements

### Portal Features
- [ ] Announcements feed on dashboard
- [ ] Dedicated announcements page
- [ ] Announcement detail view
- [ ] Filter by type
- [ ] Student of the Month spotlight card
- [ ] Read/unread tracking (optional)

### Technical Requirements
- [ ] Location-scoped visibility
- [ ] Scheduled publishing (cron or on-demand)
- [ ] Rich text rendering (sanitized)
- [ ] Email notification trigger on publish

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` | Create announcement (admin) |
| GET | `/api/announcements/[id]` | Get single announcement |
| PATCH | `/api/announcements/[id]` | Update announcement (admin) |
| DELETE | `/api/announcements/[id]` | Delete announcement (admin) |

---

## File Structure

```
src/
├── app/
│   ├── api/announcements/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── dashboard/
│   │   └── announcements/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── admin/
│       └── announcements/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [id]/page.tsx
└── components/
    ├── dashboard/
    │   ├── announcement-card.tsx
    │   └── student-of-month-card.tsx
    └── admin/
        └── announcement-form.tsx
```

---

## Acceptance Criteria

- [ ] Admin can create and schedule announcements
- [ ] Announcements scoped to locations work correctly
- [ ] Student of the Month displays prominently
- [ ] Parents only see relevant announcements
- [ ] Expired announcements auto-hide
- [ ] Mobile-friendly announcement cards

---

*Created: December 2024*
