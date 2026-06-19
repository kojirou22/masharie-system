# Masharie System

A project management dashboard for **Shoun Almasharie** — a charity organization that manages community development projects (mosques, houses, schools, water tanks, wells, food aid).

## Features

- **Public pages** (no login required)
  - Projects list with search, filter, pagination
  - Project detail with funding progress and payment releases
  - Payment releases list
  - Expenses list

- **Admin pages** (login required)
  - Dashboard with stats and charts
  - Create/edit/delete projects
  - Create payment releases
  - Create expenses
  - Reports with PDF export

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui, Radix |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Auth | Supabase Auth (Email/Password) |
| Database | Supabase PostgreSQL + RLS |
| Charts | Recharts |
| PDF Export | @react-pdf/renderer |
| Testing | Vitest |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / bun
- A Supabase project with the database schema

### Setup

1. Clone the repo:
```bash
git clone https://github.com/kojirou22/masharie-system.git
cd masharie-system
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the dev server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup

Run these SQL commands in your Supabase SQL Editor to enable public read access:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (true);
CREATE POLICY "public_read_payments" ON payment_releases FOR SELECT USING (true);
CREATE POLICY "public_read_expenses" ON expenses FOR SELECT USING (true);
```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── api/                # API routes (auth, reports, projects)
│   ├── dashboard/          # Admin dashboard
│   ├── expenses/           # Expenses pages
│   ├── login/              # Admin login
│   ├── payments/           # Payments pages
│   ├── projects/           # Projects pages
│   └── reports/            # Reports page
├── components/             # Reusable UI components
│   ├── layout/             # Layout components
│   ├── reports/            # Report charts
│   └── ui/                 # Base UI primitives
├── lib/
│   ├── pdf/                # PDF templates
│   ├── supabase/           # Supabase clients & queries
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── validations/        # Zod schemas
└── proxy.ts                # Route protection (replaces middleware)
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm run test      # Vitest
npm run typecheck # TypeScript check
```

## Access Levels

- **Public**: View projects, payments, expenses (read-only)
- **Admin**: Full CRUD + dashboard + reports (requires login)

## License

MIT
