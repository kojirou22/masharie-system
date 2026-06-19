import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectType, ProjectStatus } from '@/lib/types/database'

export default function NewProjectPage() {
  async function createProject(formData: FormData) {
    'use server'

    const supabase = await createClient()

    const raw = {
      project_number: formData.get('project_number') as string,
      name: formData.get('name') as string,
      donor: formData.get('donor') as string,
      type: formData.get('type') as ProjectType,
      area_sqm: formData.get('area_sqm') || null,
      supervisor: formData.get('supervisor') as string,
      address: formData.get('address') as string,
      batch_number: formData.get('batch_number') as string,
      batch_year: formData.get('batch_year') as string,
      budget: formData.get('budget') as string,
      status: formData.get('status') as ProjectStatus,
      has_tank: formData.get('has_tank') === 'on',
      size: formData.get('size') || null,
    }

    const parsed = projectSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      redirect(`/projects/new?error=${encodeURIComponent(errors)}`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('projects').insert({
      ...parsed.data,
      area_sqm: parsed.data.area_sqm ? Number(parsed.data.area_sqm) : null,
      budget: Number(parsed.data.budget),
      batch_year: Number(parsed.data.batch_year),
      created_by: user?.id ?? null,
    })

    if (error) {
      redirect(`/projects/new?error=${encodeURIComponent(error.message)}`)
      return
    }

    redirect('/projects')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Link href="/projects" className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to projects
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-[family-name:var(--font-fira-code)]">
        New Project
      </h1>
      <form action={createProject} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="project_number" label="Project Number" placeholder="2026-00001" required />
          <Field name="name" label="Project Name" placeholder="Community Mosque" required />
          <Field name="donor" label="Donor" placeholder="Donor name" required />
          <SelectField name="type" label="Type" options={['Mosque', 'House', 'Store', 'School Room', 'Tank', 'Well', 'School', 'Food Aid', 'Markaz']} required />
          <Field name="supervisor" label="Supervisor" placeholder="John Doe" required />
          <Field name="address" label="Address" placeholder="Barangay, City" required />
          <Field name="batch_number" label="Batch Number" placeholder="1" required />
          <Field name="batch_year" label="Batch Year" placeholder="2026" type="number" required />
          <Field name="budget" label="Budget (PHP)" placeholder="500000" type="number" required />
          <SelectField name="status" label="Status" options={['Pending', 'On Going', 'On Hold', 'Completed', 'Cancelled']} required />
          <Field name="area_sqm" label="Area (sqm)" placeholder="100" type="number" />
          <Field name="size" label="Tank Size" placeholder="5000L" />
        </div>
        <div className="flex items-center gap-2">
          <input id="has_tank" name="has_tank" type="checkbox" className="rounded border-blue-300" />
          <label htmlFor="has_tank" className="text-sm text-gray-700">Includes water tank</label>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Create Project
        </button>
      </form>
    </div>
  )
}

function Field({ name, label, placeholder, type = 'text', required = false }: {
  name: string; label: string; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-blue-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function SelectField({ name, label, options, required = false }: {
  name: string; label: string; options: string[]; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-blue-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
