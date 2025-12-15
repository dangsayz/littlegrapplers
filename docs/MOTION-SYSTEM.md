# Motion Design System — Cinematic Web Standard

> **⚠️ MANDATORY PRE-CODING CHECKLIST**  
> This document must be reviewed before implementing any animation or transition.  
> All animated components require sign-off against the Quality Gate before merge.

---

## Core Principle

Build motion as narrative infrastructure. Every animation earns its existence or dies.

---

## Hierarchy of Constraints

1. **Mobile-first, thumb-native** — If it doesn't work under a thumb at 60fps, it doesn't ship
2. **GPU-only transforms** — `transform`, `opacity`, nothing else touches the compositor
3. **Zero layout shift** — Animations never cause reflow, ever
4. **Graceful decay** — `prefers-reduced-motion` and low-power modes get instant, elegant fallbacks

---

## Motion Philosophy

- **Reveal, guide, reward** — the only three valid animation purposes
- **Cinematic restraint** — one perfect animation beats five mediocre ones
- **Physical weight** — elements have mass, momentum, and settling behavior
- **Spatial continuity** — state changes preserve the user's mental model of where things are

---

## Technical Spec

### Motion Tokens

| Token | Duration | Purpose |
|-------|----------|---------|
| `--motion-fast` | 150ms | Micro-feedback (buttons, toggles) |
| `--motion-normal` | 300ms | State transitions (modals, dropdowns) |
| `--motion-slow` | 500ms | Reveals, entrances, hero animations |

### Easing Functions

| Token | Curve | Use Case |
|-------|-------|----------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Arrivals, elements entering view |
| `--ease-in-out-cubic` | `cubic-bezier(0.65, 0, 0.35, 1)` | Morphs, shape/size changes |
| `--spring(1, 80, 10)` | Framer Motion spring | Anything needing organic life |

### Stagger Rules

- Stagger children at **50–80ms** intervals
- Never exceed **5 staggered items** without user-initiated trigger
- Stagger direction should follow reading order (LTR, top-to-bottom)

---

## Hard Rules

| Rule | Rationale |
|------|-----------|
| No hover-only interactions | Touch devices exist |
| No animation without documented rationale | Prevents decoration creep |
| No spectacle without function | Motion serves UX, not ego |
| Icons: Lucide only, vector | Consistency, scalability |
| Icon animation: ≤3° rotation, ≤10% scale | Subtle, not distracting |
| Parallax: subtle depth cues only | Tied to scroll, never decorative |

### The Audit Question

Before adding any animation, ask:

> *"What does this teach the user?"*

If there's no clear answer, the animation doesn't ship.

---

## Quality Gate

**Before merge, every animated component must pass ALL checks:**

- [ ] **Purpose documented** — Animation rationale in code comments
- [ ] **60fps on mid-tier Android** — Test on real device or throttled DevTools
- [ ] **No CLS impact** — Cumulative Layout Shift score unaffected
- [ ] **Reduced-motion alternative exists** — `prefers-reduced-motion` query implemented
- [ ] **Removes cognitive load, doesn't add it** — Clarifies state/location/feedback

---

## Implementation Checklist

When implementing motion:

```css
/* Example: Always use GPU-accelerated properties */
.element {
  /* ✅ DO */
  transform: translateY(0);
  opacity: 1;
  transition: transform var(--motion-normal) var(--ease-out-expo),
              opacity var(--motion-normal) var(--ease-out-expo);
  
  /* ❌ DON'T */
  /* height, width, top, left, margin, padding — triggers reflow */
}

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
    animation: none;
  }
}
```

---

## One-Line Mantra

> *Motion is choreography for comprehension—every frame either clarifies or it's noise.*

---

## Workflow Integration

1. **Before coding**: Review this document
2. **During development**: Reference Technical Spec for tokens
3. **Before PR**: Complete Quality Gate checklist
4. **Code review**: Verify animation rationale in comments

---

*Last updated: December 2024*
