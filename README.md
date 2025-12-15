# Little Grapplers Platform

A custom membership-based platform for Little Grapplers, a youth Brazilian Jiu-Jitsu program operating across multiple daycare facilities.

## Overview

This platform serves three distinct audiences:

1. **Public Marketing** — Educate parents and daycares about the Little Grapplers mission
2. **Admin Dashboard** — Manage students, parents, locations, programs, content, and memberships
3. **Parent Portal** — Gated access for registered parents to view videos, discussions, and announcements

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Validation | Zod |
| Forms | React Hook Form |
| State | Zustand |

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

### Marketing Site
- Bold, Nike-inspired design aesthetic
- Mobile-first responsive layout
- Location and program discovery
- Online registration flow

### Parent Portal
- Student progress tracking (belt rank, stripes)
- Program-specific video library
- Community discussion boards
- Announcements and notifications

### Admin Dashboard
- Full CRUD for all entities
- Belt and stripe promotion management
- Membership status tracking
- Content management (videos, announcements)
- Activity logging

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL for authentication |
| `NEXTAUTH_SECRET` | Secret for session encryption |
| `RESEND_API_KEY` | API key for email service |
| `EMAIL_FROM` | From address for emails |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |

## Design Principles

### Aesthetic Direction
- **Nike** — Confidence, discipline, bold typography
- **Patagonia** — Trust, mission-driven, longevity
- **Notion/Linear** — Calm, functional dashboards

High-contrast layouts (black/white) with intentional brand-color accents.

### Engineering Standards
- Mobile-first responsive design
- Accessible (WCAG 2.1 AA)
- Performance-optimized (Core Web Vitals)
- Type-safe throughout
- Production-ready error handling

## Documentation

See the `/docs` folder for detailed documentation:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design, data models, phased build plan
- **[USER-FLOWS.md](./docs/USER-FLOWS.md)** — Detailed user interaction flows

## License

Proprietary — All rights reserved.

---

Built with ❤️ for young grapplers everywhere.
