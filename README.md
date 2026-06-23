# Masharie System

A project management dashboard for Shoun Almasharie, covering community development projects, payment releases, and expenses.

## Features

- Public project, payment, and expense lists
- Public project detail with funding progress
- Admin dashboard with stats and charts
- Admin project create, edit, and guarded delete
- Admin payment and expense creation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + RLS |
| Charts | Recharts |
| Testing | Vitest |
| Hosting | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm test          # Vitest
npm run typecheck # TypeScript check
```

## Access Levels

- Public: view projects, payments, and expenses
- Admin: dashboard plus project/payment/expense mutations
