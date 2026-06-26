import { redirect, notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProjectFormSections, ProjectFormShell } from '@/components/projects/project-form-sections'
import { getProjectById } from '@/lib/supabase/queries/projects'
import { projectSchema } from '@/lib/validations/project'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import type { ProjectType, ProjectStatus } from '@/lib/types/database'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin()
  const project = await getProjectById(id)
  if (!project) notFound()

  async function updateProject(formData: FormData) {
    'use server'

    const { supabase } = await requireAdmin()

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
      redirect(`/projects/${id}/edit`)
      return
    }

    const { error } = await supabase.from('projects').update({
      ...parsed.data,
      area_sqm: parsed.data.area_sqm ? Number(parsed.data.area_sqm) : null,
      budget: Number(parsed.data.budget),
      batch_year: Number(parsed.data.batch_year),
    }).eq('id', id)

    if (error) {
      await setFlash('error', error.message)
      redirect(`/projects/${id}/edit`)
      return
    }

    await setFlash('success', 'Project updated successfully.')
    redirect(`/projects/${id}`)
  }

  async function deleteProject() {
    'use server'

    const { supabase } = await requireAdmin()

    const { data: payments, error: paymentsError } = await supabase
      .from('payment_releases')
      .select('id')
      .eq('project_id', id)
      .limit(1)

    if (paymentsError) {
      await setFlash('error', paymentsError.message)
      redirect(`/projects/${id}/edit`)
      return
    }

    if (payments && payments.length > 0) {
      await setFlash('error', 'Cannot delete: project has payment releases')
      redirect(`/projects/${id}/edit`)
      return
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      await setFlash('error', error.message)
      redirect(`/projects/${id}/edit`)
      return
    }

    await setFlash('success', 'Project deleted successfully.')
    redirect('/projects')
  }

  return (
    <ProjectFormShell
      action={updateProject}
      backHref={`/projects/${id}`}
      backLabel="Back to project"
      breadcrumbs={(
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project.project_number, href: `/projects/${id}` },
            { label: 'Edit' },
          ]}
        />
      )}
      deleteAction={deleteProject}
      description="Update project details without changing the server action field contract."
      submitLabel="Save Changes"
      title="Edit Project"
    >
      <ProjectFormSections mode="edit" values={project} />
    </ProjectFormShell>
  )
}
