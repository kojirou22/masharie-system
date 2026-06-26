import { redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProjectFormSections, ProjectFormShell } from '@/components/projects/project-form-sections'
import { projectSchema } from '@/lib/validations/project'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import type { ProjectType, ProjectStatus } from '@/lib/types/database'

function getCurrentYear() {
  return String(new Date().getFullYear())
}

export default async function NewProjectPage() {
  await requireAdmin()
  const currentYear = getCurrentYear()

  async function createProject(formData: FormData) {
    'use server'

    const { supabase, user } = await requireAdmin()

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
      await setFlash('error', errors)
      redirect('/projects/new')
      return
    }

    const { error } = await supabase.from('projects').insert({
      ...parsed.data,
      area_sqm: parsed.data.area_sqm ? Number(parsed.data.area_sqm) : null,
      budget: Number(parsed.data.budget),
      batch_year: Number(parsed.data.batch_year),
      created_by: user?.id ?? null,
    })

    if (error) {
      await setFlash('error', error.message)
      redirect('/projects/new')
      return
    }

    await setFlash('success', 'Project created successfully.')
    redirect('/projects')
  }

  return (
    <ProjectFormShell
      action={createProject}
      backHref="/projects"
      backLabel="Back to projects"
      breadcrumbs={<Breadcrumbs items={[{ label: 'Projects', href: '/projects' }, { label: 'New Project' }]} />}
      description="Create a project with grouped identity, location, batch, and funding sections."
      submitLabel="Create Project"
      title="New Project"
    >
      <ProjectFormSections mode="create" values={{ batch_year: currentYear }} />
    </ProjectFormShell>
  )
}
