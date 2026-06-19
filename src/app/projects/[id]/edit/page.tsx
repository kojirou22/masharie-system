import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjectById } from '@/lib/supabase/queries/projects'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectType, ProjectStatus } from '@/lib/types/database'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const project = await getProjectById(id)
  if (!project) notFound()

  async function updateProject(formData: FormData) {
    'use server'

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
      redirect(`/projects/${id}/edit?error=${encodeURIComponent(errors)}`)
      return
    }

    const { error } = await supabase.from('projects').update({
      ...parsed.data,
      area_sqm: parsed.data.area_sqm ? Number(parsed.data.area_sqm) : null,
      budget: Number(parsed.data.budget),
      batch_year: Number(parsed.data.batch_year),
    }).eq('id', id)

    if (error) {
      redirect(`/projects/${id}/edit?error=${encodeURIComponent(error.message)}`)
      return
    }

    redirect(`/projects/${id}`)
  }

  async function deleteProject() {
    'use server'

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      redirect(`/projects/${id}/edit?error=${encodeURIComponent('Cannot delete: project has payment releases')}`)
      return
    }

    redirect('/projects')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Link href={`/projects/${id}`} className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to project
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-[family-name:var(--font-fira-code)]">
        Edit Project
      </h1>
      <form action={updateProject} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="project_number" label="Project Number" defaultValue={project.project_number} required />
          <Field name="name" label="Project Name" defaultValue={project.name} required />
          <Field name="donor" label="Donor" defaultValue={project.donor} required />
          <SelectField name="type" label="Type" options={['Mosque', 'House', 'Store', 'School Room', 'Tank', 'Well', 'School', 'Food Aid', 'Markaz']} defaultValue={project.type} required />
          <Field name="supervisor" label="Supervisor" defaultValue={project.supervisor} required />
          <Field name="address" label="Address" defaultValue={project.address} required />
          <Field name="batch_number" label="Batch Number" defaultValue={project.batch_number} required />
          <Field name="batch_year" label="Batch Year" type="number" defaultValue={String(project.batch_year)} required />
          <Field name="budget" label="Budget (PHP)" type="number" defaultValue={String(project.budget)} required />
          <SelectField name="status" label="Status" options={['Pending', 'On Going', 'On Hold', 'Completed', 'Cancelled']} defaultValue={project.status} required />
          <Field name="area_sqm" label="Area (sqm)" type="number" defaultValue={project.area_sqm?.toString() ?? ''} />
          <Field name="size" label="Tank Size" defaultValue={project.size ?? ''} />
        </div>
        <div className="flex items-center gap-2">
          <input id="has_tank" name="has_tank" type="checkbox" defaultChecked={project.has_tank} className="rounded border-blue-300" />
          <label htmlFor="has_tank" className="text-sm text-gray-700">Includes water tank</label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={deleteProject}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-100 hover:bg-red-700 transition-colors"
          >
            Delete Project
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ name, label, placeholder, defaultValue, type = 'text', required = false }: {
  name: string; label: string; placeholder?: string; defaultValue?: string; type?: string; required?: boolean
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
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function SelectField({ name, label, options, defaultValue, required = false }: {
  name: string; label: string; options: string[]; defaultValue?: string; required?: boolean
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
        defaultValue={defaultValue}
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
