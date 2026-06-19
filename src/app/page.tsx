import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, HandCoins, Landmark } from "lucide-react";

const cards = [
  {
    href: "/projects",
    title: "Projects",
    description: "Browse community development work by donor, type, status, and budget.",
    icon: Landmark,
  },
  {
    href: "/payments",
    title: "Payment Releases",
    description: "Track released checks, vouchers, project links, and payment status.",
    icon: HandCoins,
  },
  {
    href: "/expenses",
    title: "Expenses",
    description: "Review operational expenses by account type, date, purpose, and status.",
    icon: FileText,
  },
  {
    href: "/dashboard",
    title: "Admin Dashboard",
    description: "Open protected KPI cards, reports, and admin project management links.",
    icon: BarChart3,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm shadow-blue-100/70">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Community project operations
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              A cleaner dashboard for Masharie projects, payments, and expenses.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Review public project data quickly, then sign in as an admin when you need to manage records and reports.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 active:scale-[0.99]"
              >
                View projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 active:scale-[0.99]"
              >
                Admin login
              </Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/50">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Live overview</p>
                <p className="mt-1 text-lg font-semibold">Operational clarity</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Public data</span>
            </div>
            <div className="grid gap-3">
              {[
                ["Project tracking", "Budgets, donors, status, supervisors"],
                ["Payment releases", "Checks, vouchers, dates, amounts"],
                ["Expense visibility", "Account types and release status"],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
