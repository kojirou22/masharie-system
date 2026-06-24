import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { paymentBatchSchema } from '@/lib/validations/payment'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { MultipleProjectPaymentItems } from '@/components/payments/multiple-project-payment-items'
import type { PaymentStatus } from '@/lib/types/database'

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default async function NewPaymentPage() {
  const { supabase } = await requireAdmin()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_number, name, supervisor, address')
    .order('project_number')
  const today = getTodayDateInputValue()

  async function createPayment(formData: FormData) {
    'use server'

    const { supabase, user } = await requireAdmin()

    const projectIds = formData.getAll('project_id').map(String)
    const amounts = formData.getAll('amount').map(String)

    const raw = {
      check_number: formData.get('check_number') || null,
      voucher_number: formData.get('voucher_number') || null,
      status: formData.get('status') as PaymentStatus,
      notes: formData.get('notes') || null,
      released_date: formData.get('released_date') || null,
      line_items: projectIds.map((projectId, index) => ({
        project_id: projectId,
        amount: amounts[index],
      })),
    }

    const parsed = paymentBatchSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      await setFlash('error', errors)
      redirect('/payments/new')
    }

    const rows = parsed.data.line_items.map((item) => ({
      project_id: item.project_id,
      check_number: parsed.data.check_number,
      voucher_number: parsed.data.voucher_number,
      amount: item.amount,
      status: parsed.data.status,
      notes: parsed.data.notes,
      released_date: parsed.data.released_date,
      released_at: parsed.data.released_date || null,
      released_by: user.id,
    }))

    const { error } = await supabase.from('payment_releases').insert(rows)

    if (error) {
      await setFlash('error', error.message)
      redirect('/payments/new')
    }

    await setFlash('success', `${rows.length} payment allocation${rows.length === 1 ? '' : 's'} created successfully.`)
    redirect('/payments')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'New Payment' }]} />
      <Link href="/payments" className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to payments
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-mono">
        New Payment Release
      </h1>
      <form action={createPayment} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4">
        <input type="hidden" name="status" value="Released" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="check_number" label="Check Number" placeholder="e.g. 123456" />
          <Field name="voucher_number" label="Voucher Number" placeholder="e.g. V-2026-001" />
          <Field name="released_date" label="Release Date" type="date" defaultValue={today} />
        </div>
        <MultipleProjectPaymentItems projects={projects ?? []} />
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-blue-700 mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Optional notes..."
            className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Create Payment
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
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
