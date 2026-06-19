import { requireAdminResponse } from '@/lib/auth/admin'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminResponse()
  if (admin.response) return admin.response

  const { id } = await params
  const { supabase } = admin

  const { data: payments } = await supabase
    .from('payment_releases')
    .select('id')
    .eq('project_id', id)
    .limit(1)

  if (payments && payments.length > 0) {
    return new Response('Project has payment releases and cannot be deleted', { status: 400 })
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
