# Little Grapplers - Full-Stack Academy Platform

**Live Site:** [littlegrapplers.net](https://littlegrapplers.net)

A complete business management platform for youth martial arts academies. Features online enrollment with digital waivers, parent portals, Stripe payment processing, and multi-location admin dashboard.

Built as a freelance project to replace a basic Squarespace site with a fully custom solution.

---

## What I Built

### Public Website
- Modern marketing pages with program information and pricing
- Location finder with interactive maps
- **Online enrollment with legally-compliant digital waiver signing**
- Mobile-first responsive design with premium UI/UX

### Parent Portal (Authenticated)
- View enrolled students with belt rank and progress tracking
- Access curriculum video library organized by skill level
- Community discussion forums with location-based PIN access
- Payment history, receipts, and subscription management

### Admin Dashboard
- **Multi-location support** with role-based access (owner, location admin, instructor)
- Student management with belt/stripe promotions and attendance
- Revenue analytics with Stripe integration
- Announcement system, Student of the Month features
- Balance reminders and automated payment notifications
- Platform controls: kill switch, maintenance mode, feature flags

### Developer Portal
- Work order system for client feature requests
- Invoice generation and payment tracking
- Platform value calculator showing ROI

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| Payments | Stripe (Subscriptions + One-time) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Deployment | Vercel |
| Validation | Zod |
| Forms | React Hook Form |

## Getting Started

### Prerequisites

- Node.js 18.17+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/littlegrapplers.net.git
   cd littlegrapplers.net
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env.local
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
littlegrapplers.net/
├── docs/                    # Architecture & design documentation
│   ├── ARCHITECTURE.md      # System design, data models, tech decisions
│   └── USER-FLOWS.md        # Detailed user flow diagrams
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (marketing)/     # Public marketing pages
│   │   ├── (auth)/          # Authentication pages
│   │   ├── portal/          # Parent portal (protected)
│   │   ├── admin/           # Admin dashboard (protected)
│   │   └── api/             # API routes
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Header, footer, navigation
│   │   ├── marketing/       # Marketing-specific components
│   │   ├── portal/          # Portal-specific components
│   │   ├── admin/           # Admin-specific components
│   │   └── shared/          # Cross-cutting components
│   └── lib/
│       ├── utils.ts         # Utility functions
│       ├── constants.ts     # Application constants
│       └── db.ts            # Prisma client
├── .env.example             # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Key Features

| Feature | Description |
|---------|-------------|
| Digital Waivers | E-signatures with PDF generation and legal compliance |
| Stripe Payments | Recurring subscriptions, one-time payments, automated receipts |
| Multi-Location | Manage multiple facilities from one dashboard |
| Role-Based Access | Owner, admin, instructor permission levels |
| Video Library | Upload and organize curriculum videos by belt level |
| Community Forums | Location-based discussion boards with PIN protection |
| Progress Tracking | Belt ranks, stripes, attendance history |
| Notifications | Email alerts for enrollments, payments, reminders |
| Platform Controls | Kill switch, maintenance mode, feature toggles |

## Screenshots

> Add screenshots here: homepage, enrollment form, parent dashboard, admin panel

## Environment Variables

See `.env.example` for required configuration:
- Supabase credentials
- Clerk authentication keys
- Stripe API keys (test and live)

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

See `/docs` for detailed documentation:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System design and data models
- [USER-FLOWS.md](./docs/USER-FLOWS.md) — User interaction flows

---

## About This Project

This was built as a complete business solution for a real client, replacing their Squarespace site with a custom platform that handles everything from marketing to payments to student management.

**Project Value:** $100k+ in equivalent agency pricing  
**Actual Cost:** $450  
**Timeline:** Built and deployed in production

---

**Contact:** [Your email/portfolio link here]
