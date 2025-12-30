# Mobile Bottom Navigation System

> Facebook-style floating island navigation for mobile devices

## Overview

The `MobileBottomNav` component provides a modern, accessible floating bottom navigation bar that appears only on mobile devices (< 1024px viewport). It adapts its navigation items based on the current route context and user authentication state.

## File Location

```
src/components/layout/mobile-bottom-nav.tsx
```

## Features

- **Floating island design** — Rounded pill shape with backdrop blur, shadows, and subtle gradients
- **Context-aware navigation** — Shows different nav sets based on route and user role
- **Animated active indicator** — Spring animation with gradient pill background
- **Safe area support** — Respects iPhone notch/home indicator
- **Accessibility compliant** — ARIA labels, roles, focus states, and keyboard navigation
- **Performance optimized** — GPU-accelerated animations, layout stability

---

## Navigation Contexts

The component automatically switches between different navigation sets:

### 1. Public Pages (Marketing)
**Routes:** `/`, `/about`, `/locations`, `/faq`, `/contact`, `/programs`, `/benefits`, `/privacy`, `/terms`

| Icon | Label | Route |
|------|-------|-------|
| Home | Home | `/` |
| Info | About | `/about` |
| MapPin | Locations | `/locations` |
| HelpCircle | FAQ | `/faq` |
| Phone | Contact | `/contact` |
| User | Sign In | *(modal)* — only for signed-out users |
| LayoutDashboard | Portal | `/dashboard` — only for signed-in users |

### 2. Dashboard (Parent Portal)
**Routes:** `/dashboard/*`, `/community/*`

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Home | `/dashboard` (exact) |
| Users | Students | `/dashboard/students` |
| Video | Videos | `/dashboard/videos` |
| MessageSquare | Discuss | `/dashboard/discussions` |
| Settings | Settings | `/dashboard/settings` |

### 3. Admin Panel
**Routes:** `/dashboard/admin/*` (admin users only)

| Icon | Label | Route |
|------|-------|-------|
| Shield | Dashboard | `/dashboard/admin` (exact) |
| Users | Users | `/dashboard/admin/users` |
| Video | Videos | `/dashboard/admin/videos` |
| Settings | Settings | `/dashboard/admin/settings` |

---

## Hidden Pages

The bottom nav is **completely hidden** on these routes to avoid interference with focused flows:

```typescript
const HIDDEN_PATHS = [
  '/sign-in',      // Auth flow
  '/sign-up',      // Auth flow
  '/onboarding',   // Onboarding wizard
  '/waiver',       // Legal document signing
  '/inquiry',      // Contact form focus
];
```

---

## Route Matching Logic

### Exact Match
Items with `exactMatch: true` only highlight when the pathname exactly equals the href.

```typescript
{ href: '/dashboard', exactMatch: true }
// Active only on /dashboard, NOT on /dashboard/students
```

### Prefix Match
Default behavior matches the route and all nested routes.

```typescript
{ href: '/dashboard/students' }
// Active on /dashboard/students AND /dashboard/students/123
```

### Custom Match Paths
Use `matchPaths` array for complex matching scenarios.

```typescript
{ 
  href: '/dashboard/videos',
  matchPaths: ['/dashboard/videos', '/dashboard/videos/new']
}
```

---

## Edge Cases Handled

### 1. Authentication States
- **Loading state**: Uses `isLoaded` from Clerk to prevent flash of wrong content
- **Signed out on public pages**: Shows "Sign In" button
- **Signed in on public pages**: Shows "Portal" shortcut to dashboard
- **Signed in on dashboard**: Shows Settings button instead

### 2. Admin Detection
```typescript
const ADMIN_EMAIL = 'dangzr1@gmail.com';
const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;
```
- Admin users in `/dashboard/admin/*` see admin-specific nav
- Non-admin users see regular dashboard nav even if they navigate to admin routes

### 3. Community Pages
- `/community/*` routes use dashboard nav items
- Allows quick navigation back to main dashboard features

### 4. Nested Routes
- `/dashboard` exact match prevents it from being active on all dashboard subroutes
- Subroute matching uses trailing slash check: `pathname.startsWith(path + '/')`

### 5. Safe Area (iPhone Notch)
```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```
Prevents content from being hidden behind iPhone home indicator.

### 6. Desktop Hidden
```tsx
className="lg:hidden"
```
Nav is completely removed from DOM on desktop (≥1024px).

---

## Accessibility

### ARIA Attributes
```tsx
<div role="navigation" aria-label="Mobile navigation">
  <Link aria-label="Navigate to Home" aria-current="page">
```

### Focus States
```tsx
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EC4B6] focus-visible:ring-offset-2'
```

### Screen Reader Support
- All icons have `aria-hidden="true"`
- Decorative elements have `aria-hidden="true"`
- Links have descriptive `aria-label` attributes

### Keyboard Navigation
- Tab order follows visual order
- Focus ring clearly visible
- Enter/Space activates links

---

## Animation Details

### Entry Animation
```typescript
initial={{ y: 100, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
```

### Active Tab Animation
```typescript
<AnimatePresence mode="wait">
  <motion.div
    layoutId="activeTab"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  />
</AnimatePresence>
```

### Reduced Motion
Respects `prefers-reduced-motion` via global CSS:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Layout Integration

### Marketing Layout
```tsx
// src/app/(marketing)/layout.tsx
<main className="pb-24 lg:pb-0">{children}</main>
<MobileBottomNav />
```

### Dashboard Layout
```tsx
// src/app/dashboard/layout.tsx
<main className="pb-24 lg:pb-6">{children}</main>
<MobileBottomNav />
```

**Important:** Add `pb-24` (96px) bottom padding to main content on mobile to prevent content from being hidden behind the nav.

---

## Styling

### Colors
| Variable | Value | Usage |
|----------|-------|-------|
| Brand Primary | `#2EC4B6` | Active state gradient start |
| Brand Secondary | `#8FE3CF` | Active state gradient end |
| Text Primary | `#1F2A44` | Inactive text (50% opacity) |
| Background | `white/95` | Nav background with blur |

### Dimensions
| Property | Value |
|----------|-------|
| Nav height | ~56px |
| Bottom padding | 16px (+ safe area) |
| Side padding | 16px |
| Max width | 448px (max-w-md) |
| Border radius | 28px |
| Min touch target | 56px × 44px |

---

## Testing Checklist

### Functional Tests
- [ ] Nav appears on mobile viewport (< 1024px)
- [ ] Nav hidden on desktop viewport (≥ 1024px)
- [ ] Correct nav items show on public pages
- [ ] Correct nav items show on dashboard
- [ ] Correct nav items show for admin in admin section
- [ ] Active state highlights correct item
- [ ] Links navigate to correct routes
- [ ] Sign In button opens Clerk modal
- [ ] Hidden on `/sign-in`, `/sign-up`, `/onboarding`, `/waiver`, `/inquiry`

### Auth State Tests
- [ ] Signed out: Shows Sign In button on public pages
- [ ] Signed in: Shows Portal button on public pages
- [ ] Signed in: Shows Settings on dashboard
- [ ] Admin: Shows admin nav in admin section

### Accessibility Tests
- [ ] Tab navigation works correctly
- [ ] Focus ring visible on all interactive elements
- [ ] Screen reader announces navigation landmarks
- [ ] Active page announced with aria-current

### Visual Tests
- [ ] Floating island centered at bottom
- [ ] Safe area respected on iPhone
- [ ] Gradient fade above nav visible
- [ ] Active pill animates smoothly
- [ ] No content hidden behind nav

---

## Known Limitations

1. **No gesture support** — No swipe-to-navigate
2. **Static nav items** — Cannot be customized per-user
3. **Single admin email** — Admin detection uses hardcoded email
4. **Community nav** — Uses dashboard nav, not community-specific

---

## Future Improvements

- [ ] Badge/notification indicators on nav items
- [ ] Haptic feedback on tap (if supported)
- [ ] Swipe gestures for navigation
- [ ] User-customizable nav order
- [ ] Dynamic admin detection from database role
- [ ] Community-specific nav items

---

## Changelog

### v1.0.0 (2024-12-29)
- Initial implementation
- Public, dashboard, and admin nav contexts
- Hidden pages support
- Accessibility compliance
- Safe area support
- Animation system
