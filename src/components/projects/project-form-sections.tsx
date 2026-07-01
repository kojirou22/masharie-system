import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { arabicTextClass } from '@/lib/utils/formatters'
import type { ProjectStatus, ProjectType } from '@/lib/types/database'

const PROJECT_TYPE_OPTIONS: ProjectType[] = [
  'Mosque',
  'House',
  'Store',
  'School Room',
  'Tank',
  'Well',
  'School',
  'Food Aid',
  'Markaz',
]

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  'Pending',
  'On Going',
  'On Hold',
  'Completed',
  'Cancelled',
]

type ProjectFormValues = Partial<{
  project_number: string
  name: string
  donor: string
  type: ProjectType
  area_sqm: number | string | null
  supervisor: string
  address: string
  batch_number: string
  batch_year: number | string
  budget: number | string
  status: ProjectStatus
  has_tank: boolean
  size: string | null
}>

type ProjectFormShellProps = {
  action: ComponentProps<'form'>['action']
  backHref: string
  backLabel: string
  breadcrumbs?: ReactNode
  children: ReactNode
  deleteAction?: ComponentProps<'form'>['action']
  description: string
  submitLabel: string
  title: string
}

export function ProjectFormShell({
  action,
  backHref,
  backLabel,
  breadcrumbs,
  children,
  deleteAction,
  description,
  submitLabel,
  title,
}: ProjectFormShellProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {breadcrumbs}
      <Link href={backHref} className="mb-4 inline-block text-sm font-medium text-primary hover:underline">
        ← {backLabel}
      </Link>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="gap-2 border-b border-border/80">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-6 p-4 sm:p-6">
            {children}
            <div className="flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                {submitLabel}
              </Button>
              <p className="text-xs text-muted-foreground">
                Fields marked <span className="text-destructive">*</span> are required.
              </p>
            </div>
          </CardContent>
        </form>
      </Card>

      {deleteAction && (
        <form action={deleteAction} className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Delete this project only when it has no payment releases.
              </p>
            </div>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              Delete Project
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export function ProjectFormSections({ values = {}, mode }: { values?: ProjectFormValues; mode: 'create' | 'edit' }) {
  return (
    <div className="space-y-5">
      <FormSection
        title="Identity"
        description="Project number, name, donor, and classification."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field name="project_number" label="Project Number" placeholder="2026-00001" defaultValue={values.project_number} required />
          <Field name="name" label="Project Name" placeholder="Community Mosque" defaultValue={values.name} required arabicAware />
          <Field name="donor" label="Donor" placeholder="Donor name" defaultValue={values.donor} required arabicAware />
          <SelectField name="type" label="Type" options={PROJECT_TYPE_OPTIONS} defaultValue={values.type} required />
        </div>
      </FormSection>

      <FormSection
        title="Location and supervision"
        description="Keep Arabic names and addresses readable at normal weight."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field name="supervisor" label="Supervisor" placeholder="John Doe" defaultValue={values.supervisor} required arabicAware />
          <Field name="address" label="Address" placeholder="Barangay, City" defaultValue={values.address} required arabicAware />
        </div>
      </FormSection>

      <FormSection
        title="Batch and budget"
        description={mode === 'create' ? 'New projects default to the current batch year.' : 'Edit the stored batch and funding values.'}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field name="batch_number" label="Batch Number" placeholder="1" defaultValue={values.batch_number} required />
          <Field name="batch_year" label="Batch Year" placeholder="2026" type="number" defaultValue={values.batch_year} required />
          <Field name="budget" label="Budget (PHP)" placeholder="500000" type="number" defaultValue={values.budget} required />
          <SelectField name="status" label="Status" options={PROJECT_STATUS_OPTIONS} defaultValue={values.status} required />
          <Field name="area_sqm" label="Area (sqm)" placeholder="100" type="number" defaultValue={values.area_sqm ?? ''} />
          <Field name="size" label="Tank Size" placeholder="5000L" defaultValue={values.size ?? ''} />
        </div>
        <CheckboxField name="has_tank" label="Includes water tank" defaultChecked={values.has_tank} />
      </FormSection>
    </div>
  )
}

function FormSection({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <section className="rounded-2xl border border-border/80 bg-background/60 p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Field({
  arabicAware = false,
  className,
  defaultValue,
  label,
  name,
  placeholder,
  required = false,
  type = 'text',
}: {
  arabicAware?: boolean
  className?: string
  defaultValue?: string | number | null
  label: string
  name: string
  placeholder?: string
  required?: boolean
  type?: string
}) {
  const value = defaultValue == null ? '' : String(defaultValue)

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        required={required}
        className={cn(
          'h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35',
          arabicAware && arabicTextClass(value),
          className,
        )}
      />
    </div>
  )
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
  required = false,
}: {
  defaultValue?: string
  label: string
  name: string
  options: readonly string[]
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <option value="" disabled={required}>
          Select...
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function CheckboxField({ defaultChecked = false, label, name }: { defaultChecked?: boolean; label: string; name: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/80 bg-muted/35 px-3 py-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/35"
      />
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
    </div>
  )
}
