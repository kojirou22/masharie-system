import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
            {item.href ? (
              <Link href={item.href} className="rounded-md font-medium text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500">
                {item.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-950">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
