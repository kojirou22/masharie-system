import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, HandCoins, Landmark } from 'lucide-react'

const primaryEntries = [
  {
    href: '/projects',
    title: 'Projects',
    description: 'Browse project records by batch, type, status, supervisor, and budget.',
    icon: Landmark,
    meta: 'Public registry',
  },
  {
    href: '/payments',
    title: 'Payment Releases',
    description: 'Review released checks, vouchers, linked projects, dates, and amounts.',
    icon: HandCoins,
    meta: 'Release tracking',
  },
  {
    href: '/expenses',
    title: 'Expenses',
    description: 'Track operating expenses by date, purpose, requester, account, and status.',
    icon: FileText,
    meta: 'Expense registry',
  },
]

const secondaryEntries = [
  { href: '/dashboard', label: 'Admin dashboard', description: 'KPIs, charts, and protected management links.', icon: BarChart3 },
  { href: '/login', label: 'Admin login', description: 'Sign in to create or edit operational records.', icon: ArrowRight },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
      <section className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Masharie operations</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Open the records you need.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Projects, payment releases, and expenses are organized for quick lookup. Admin actions stay behind sign-in.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              View projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              Admin login
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        {primaryEntries.map((entry) => {
          const Icon = entry.icon
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className="group rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {entry.meta}
                </span>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">{entry.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open registry
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          )
        })}
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {secondaryEntries.map((entry) => {
          const Icon = entry.icon
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/70 p-4 text-sm shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">{entry.label}</span>
                <span className="block text-muted-foreground">{entry.description}</span>
              </span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
