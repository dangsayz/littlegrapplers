# Task: Video Library System

> **Status:** Mostly Complete  
> **Priority:** High  
> **Estimated Effort:** 4-6 hours

---

## Overview

Build a complete video library system that allows admins to upload/manage videos and parents to view program-scoped content.

---

## Requirements

### Database Schema
- [x] `videos` table with: id, title, description, video_url, thumbnail_url, duration, category, location_ids, is_public, sort_order, created_at, updated_at
- [x] `video_categories` table for organizing content

### Admin Features
- [x] Video list page with filters (category, location, status)
- [x] Add video form (title, description, URL/embed, thumbnail, category, location scope)
- [x] Edit video page
- [x] Delete video with confirmation
- [ ] Reorder videos (drag & drop or sort order)
- [ ] Bulk actions (delete, change category)

### Portal Features
- [x] Video grid with thumbnails
- [x] Category filter tabs
- [ ] Search functionality
- [x] Video detail page with embedded player
- [ ] Location-scoped access (only show videos for user's locations)

### Technical Requirements
- [ ] Support YouTube/Vimeo embeds
- [ ] Support direct video URLs (Supabase Storage)
- [ ] Thumbnail generation or manual upload
- [ ] Responsive video player
- [ ] Loading states and error handling

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List videos (with filters) |
| POST | `/api/videos` | Create video (admin) |
| GET | `/api/videos/[id]` | Get single video |
| PATCH | `/api/videos/[id]` | Update video (admin) |
| DELETE | `/api/videos/[id]` | Delete video (admin) |
| GET | `/api/videos/categories` | List categories |

---

## File Structure

```
src/
├── app/
│   ├── api/videos/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── categories/route.ts
│   ├── dashboard/
│   │   └── videos/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── admin/
│       └── videos/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [id]/page.tsx
└── components/
    ├── dashboard/
    │   ├── video-card.tsx
    │   └── video-player.tsx
    └── admin/
        └── video-form.tsx
```

---

## Acceptance Criteria

- [ ] Admin can add videos with YouTube/Vimeo URLs
- [ ] Admin can categorize and scope videos to locations
- [ ] Parents see only videos for their location(s)
- [ ] Videos play inline without leaving the page
- [ ] Mobile-responsive video grid
- [ ] Empty states when no videos available

---

*Created: December 2024*
