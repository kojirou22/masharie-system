import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { paymentSchema } from '@/lib/validations/payment'
import type { PaymentStatus } from '@/lib/types/database'

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const [{ data: payment, error: paymentError }, { data: projects }] = await Promise.all([
    supabase
      .from('payment_releases')
      .select('*, project:projects(name, project_number)')
      .eq('id', id)
      .single(),
    supabase
      .from('projects')
      .select('id, project_number, name')
      .order('project_number'),
  ])

  if (paymentError || !payment) notFound()

  async function updatePayment(formData: FormData) {
    'use server'

    const { supabase } = await requireAdmin()

    const raw = {
      project_id: formData.get('project_id') as string,
      check_number: formData.get('check_number') || null,
      voucher_number: formData.get('voucher_number') || null,
      amount: formData.get('amount') as string,
      status: formData.get('status') as PaymentStatus,
      notes: formData.get('notes') || null,
      released_date: formData.get('released_date') || null,
    }

    const parsed = paymentSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message).join(', ')
      await setFlash('error', errors)
      redirect(`/payments/${id}/edit`)
    }

    const { error } = await supabase
      .from('payment_releases')
      .update({
        ...parsed.data,
        amount: Number(parsed.data.amount),
        released_at: parsed.data.released_date || null,
      })
      .eq('id', id)

    if (error) {
      await setFlash('error', error.message)
      redirect(`/payments/${id}/edit`)
    }

    await setFlash('success', 'Payment updated successfully.')
    redirect('/payments')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'Edit Payment' }]} />
      <Link href="/payments" className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to payments
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-mono">
        Edit Payment Release
      </h1>
      <form action={updatePayment} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-blue-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            id="project_id"
            name="project_id"
            required
            defaultValue={payment.project_id}
            className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Select a project...</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_number} — {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="check_number" label="Check Number" defaultValue={payment.check_number ?? ''} />
          <Field name="voucher_number" label="Voucher Number" defaultValue={payment.voucher_number ?? ''} />
          <Field name="amount" label="Amount (PHP)" type="number" defaultValue={String(payment.amount)} required />
          <SelectField name="status" label="Status" options={['Pending', 'Released', 'Cancelled']} defaultValue={payment.status} required />
          <Field name="released_date" label="Release Date" type="date" defaultValue={payment.released_date ?? ''} />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-blue-700 mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={payment.notes ?? ''}
            placeholder="Optional notes..."
            className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
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
        min={type === 'number' ? '0.01' : undefined}
        step={type === 'number' ? '0.01' : undefined}
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
        <option value="" disabled={required}>Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}
