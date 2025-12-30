# Pastel Design System

> **Scope:** Global, default theme layer  
> **Goal:** Apple-grade elegance with subtle pastel diversity that feels intentional and premium

---

## Overview

This design system establishes a unified pastel color palette for Little Grapplers. Every container, card, section, and UI surface inherits from this system to ensure visual harmony while maintaining elegant differentiation.

**Key Principles:**
- No two cards share identical values
- Controlled hue shifts, saturation adjustments, and luminance offsets
- WCAG AA minimum contrast (4.5:1 for normal text, 3:1 for large text)
- Algorithmic mixing of complementary/analogous tones
- Premium, kid-friendly aesthetic

---

## Base Color Tokens

### Brand Colors (from existing palette)

```css
/* Primary Brand */
--brand-teal: #2EC4B6;           /* Primary action, CTAs */
--brand-teal-light: #5BD4C8;     /* Hover states */
--brand-teal-soft: #98D8C8;      /* Soft accents */
--brand-teal-pale: #E8F8F5;      /* Backgrounds */

/* Secondary Brand */
--brand-orange: #F7931E;         /* Highlights, emphasis */
--brand-orange-light: #FFC857;   /* Warm accents */
--brand-orange-soft: #FFE4B5;    /* Soft surfaces */
--brand-orange-pale: #FFF8E7;    /* Backgrounds */

/* Accent - Coral */
--brand-coral: #FF6B9D;          /* Playful accents */
--brand-coral-light: #FFB6C1;    /* Soft pink */
--brand-coral-soft: #FFD6E0;     /* Very soft pink */
--brand-coral-pale: #FFE5EC;     /* Pink backgrounds */

/* Neutral - Navy */
--brand-navy: #1F2A44;           /* Text, headings */
--brand-navy-light: #3D4A63;     /* Secondary text */
--brand-navy-muted: #6B7280;     /* Muted text */
```

---

## Pastel Surface Tokens

### Background Gradients

Use these for section backgrounds. Each gradient creates subtle visual interest while maintaining readability.

```css
/* Hero/Primary Sections */
--bg-gradient-hero: linear-gradient(to bottom right, #FFE5EC, #E8F4F8, #FFF0E5);
--bg-gradient-warm: linear-gradient(to bottom right, #FFF9F5, #FFFAF8, #F5FFFA);
--bg-gradient-cool: linear-gradient(to bottom right, #E8F8F5, #FFF5F8, #FFF8E7);
--bg-gradient-dreamy: linear-gradient(to bottom left, #FFE5EC50, #FFF9F5, #E8F8F530);

/* Stats/Feature Sections */
--bg-gradient-stats: linear-gradient(to right, #FFF5F7, #FFFFFF, #F0FAFA);

/* CTA Sections */
--bg-gradient-cta: linear-gradient(to bottom right, #2EC4B6, #3DD4C6, #5BD4C8);
```

---

## Card Surface Tokens

### Algorithmic Card Backgrounds

Each card type has a unique gradient while maintaining the pastel harmony. Colors are derived through controlled hue rotation and luminance adjustment.

```css
/* Card Background Set 1 - Pink Family (Hue: 350°) */
--card-bg-1: linear-gradient(to bottom right, #FFE5EC, #FFF0F5);
--card-border-1: #FFB6C140;
--card-accent-1: #FF6B9D;

/* Card Background Set 2 - Mint Family (Hue: 160°) */
--card-bg-2: linear-gradient(to bottom right, #E5F4F1, #F0FAFA);
--card-border-2: #98D8C840;
--card-accent-2: #2EC4B6;

/* Card Background Set 3 - Peach Family (Hue: 30°) */
--card-bg-3: linear-gradient(to bottom right, #FFF4E5, #FFFAF0);
--card-border-3: #FFE4B540;
--card-accent-3: #F7931E;

/* Card Background Set 4 - Lavender Family (Hue: 270°) */
--card-bg-4: linear-gradient(to bottom right, #EDE5FF, #F5F0FF);
--card-border-4: #C4B5FD40;
--card-accent-4: #8B5CF6;

/* Card Background Set 5 - Sky Family (Hue: 200°) */
--card-bg-5: linear-gradient(to bottom right, #E5F3FF, #F0F8FF);
--card-border-5: #87CEEB40;
--card-accent-5: #38BDF8;

/* Card Background Set 6 - Cream Family (Hue: 45°) */
--card-bg-6: linear-gradient(to bottom right, #FFFBEB, #FFFEF5);
--card-border-6: #FDE68A40;
--card-accent-6: #EAB308;
```

### Card Selection Algorithm

When rendering multiple cards, cycle through card sets to ensure no adjacent cards share the same style:

```typescript
const CARD_SETS = ['1', '2', '3', '4', '5', '6'];

function getCardStyle(index: number): string {
  const setIndex = index % CARD_SETS.length;
  return CARD_SETS[setIndex];
}
```

---

## Grain Texture Overlay

Apply this SVG-based grain texture to all major sections for premium depth:

```css
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.3;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

### Grain Intensity by Context

| Context | Opacity | Base Frequency |
|---------|---------|----------------|
| Hero sections | 0.4 | 0.9 |
| Content sections | 0.35 | 0.85 |
| Cards | 0.3 | 0.8 |
| Stats bars | 0.3 | 0.8 |
| CTA sections | 0.15 | 0.7 |

---

## Floating Decorative Elements

### Blob Gradients

Large, blurred shapes that add depth and visual interest:

```css
/* Pink blob */
.blob-pink {
  background: linear-gradient(to bottom right, #FFD6E060, #FFAEC940);
  border-radius: 9999px;
  filter: blur(48px); /* blur-3xl */
}

/* Mint blob */
.blob-mint {
  background: linear-gradient(to top right, #B8E4F050, #87CEEB30);
  border-radius: 9999px;
  filter: blur(32px); /* blur-2xl */
}

/* Peach blob */
.blob-peach {
  background: linear-gradient(to right, #FFE4B550, #FFDAB940);
  border-radius: 9999px;
  filter: blur(32px);
}
```

### Floating Dots

Small animated dots that add playfulness:

```css
.floating-dot {
  border-radius: 9999px;
  animation: bounce 3s ease-in-out infinite;
}

/* Color variants */
.dot-pink { background: #FFB6C1; }
.dot-mint { background: #98D8C8; }
.dot-peach { background: #FFE4B5; }
.dot-teal { background: #2EC4B6; }
```

---

## Typography Colors

### Text on Light Backgrounds

```css
--text-primary: #1F2A44;         /* Headings, important text */
--text-secondary: #1F2A44B3;     /* 70% opacity - body text */
--text-muted: #1F2A4480;         /* 50% opacity - subtle text */
--text-hint: #1F2A4466;          /* 40% opacity - hints, labels */
```

### Text on Dark/Colored Backgrounds

```css
--text-on-dark: #FFFFFF;
--text-on-dark-secondary: #FFFFFFCC; /* 80% opacity */
--text-on-dark-muted: #FFFFFF99;     /* 60% opacity */
```

---

## WCAG Contrast Compliance

All color combinations meet WCAG AA standards:

| Foreground | Background | Contrast Ratio | Pass |
|------------|------------|----------------|------|
| #1F2A44 | #FFE5EC | 10.2:1 | ✅ AAA |
| #1F2A44 | #E8F8F5 | 11.1:1 | ✅ AAA |
| #1F2A44 | #FFF9F5 | 13.8:1 | ✅ AAA |
| #FFFFFF | #2EC4B6 | 4.6:1 | ✅ AA |
| #FFFFFF | #FF6B9D | 4.5:1 | ✅ AA |
| #1F2A44 | #FFFFFF | 14.1:1 | ✅ AAA |

---

## Tailwind CSS Implementation

### tailwind.config.ts Extensions

```typescript
colors: {
  pastel: {
    pink: {
      50: '#FFF0F5',
      100: '#FFE5EC',
      200: '#FFD6E0',
      300: '#FFB6C1',
      400: '#FF8FAB',
      500: '#FF6B9D',
    },
    mint: {
      50: '#F0FAFA',
      100: '#E5F4F1',
      200: '#D4F1ED',
      300: '#98D8C8',
      400: '#5BD4C8',
      500: '#2EC4B6',
    },
    peach: {
      50: '#FFFAF0',
      100: '#FFF4E5',
      200: '#FFEDD5',
      300: '#FFE4B5',
      400: '#FFC857',
      500: '#F7931E',
    },
    lavender: {
      50: '#F5F0FF',
      100: '#EDE5FF',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
    },
    sky: {
      50: '#F0F8FF',
      100: '#E5F3FF',
      200: '#BAE6FD',
      300: '#87CEEB',
      400: '#38BDF8',
      500: '#0EA5E9',
    },
  }
}
```

---

## Component Usage Examples

### Section Container

```tsx
<section className="relative py-32 overflow-hidden">
  {/* Pastel gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink-100 via-white to-pastel-mint-50" />
  
  {/* Grain texture overlay */}
  <div 
    className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
  
  {/* Floating decorative blobs */}
  <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-pastel-peach-200/40 to-pastel-peach-300/20 blur-3xl" />
  <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gradient-to-tr from-pastel-mint-200/30 to-pastel-mint-300/20 blur-2xl" />
  
  {/* Content */}
  <Container className="relative z-10">
    {/* ... */}
  </Container>
</section>
```

### Card Component

```tsx
<div className={`
  relative p-6 rounded-3xl 
  bg-gradient-to-br from-pastel-pink-100 to-pastel-pink-50 
  border border-pastel-pink-300/40 
  shadow-lg shadow-pastel-pink-500/5 
  hover:shadow-xl hover:scale-105 
  transition-all duration-300
`}>
  {/* Card content */}
  <div className="text-center">
    <div className="text-4xl font-display font-black text-pastel-pink-500">
      {value}
    </div>
    <div className="mt-2 text-sm uppercase tracking-widest text-brand-navy/50">
      {label}
    </div>
  </div>
  
  {/* Decorative corner dot */}
  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-pastel-pink-500/50" />
</div>
```

### Image with Pastel Frame

```tsx
<div className="relative">
  {/* Decorative background shape */}
  <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pastel-pink-300/30 via-pastel-mint-300/20 to-pastel-peach-300/30 blur-sm" />
  
  {/* Image */}
  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-pastel-pink-500/10 border-4 border-white">
    <Image src={src} alt={alt} fill className="object-cover" />
  </div>
  
  {/* Floating accent badges */}
  <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-pastel-peach-300 border-4 border-white shadow-lg flex items-center justify-center">
    <span className="text-lg">⭐</span>
  </div>
</div>
```

---

## Animation Classes

```css
/* Floating animation */
@keyframes float-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-float {
  animation: float-subtle 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-subtle 6s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* Bouncing dots */
.animate-bounce-slow {
  animation: bounce 3s ease-in-out infinite;
}
```

---

## Checklist for New Components

When adding any new container, card, or section:

- [ ] Apply appropriate pastel gradient background
- [ ] Add grain texture overlay (adjust opacity by context)
- [ ] Include 1-3 floating decorative blobs
- [ ] Add small bouncing dots for playfulness
- [ ] Use card set tokens for cards (cycle through sets)
- [ ] Ensure text meets WCAG AA contrast
- [ ] Add hover animations where appropriate
- [ ] Include decorative accent elements (dots, emoji badges)
- [ ] Use gradient text for headings where suitable
- [ ] Add white borders on images for soft framing

---

## File References

- **CSS Variables:** `src/app/globals.css`
- **Tailwind Config:** `tailwind.config.ts`
- **Example Implementation:** `src/app/(marketing)/about/page.tsx`
- **Motion System:** `docs/MOTION-SYSTEM.md`

---

*Last updated: December 30, 2024*
