import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { paymentSchema } from '@/lib/validations/payment'
import type { PaymentStatus } from '@/lib/types/database'

export default async function NewPaymentPage() {
  const supabase = await createClient()

  // Fetch projects for the select dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_number, name')
    .order('project_number')

  async function createPayment(formData: FormData) {
    'use server'

    const supabase = await createClient()

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
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      redirect(`/payments/new?error=${encodeURIComponent(errors)}`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('payment_releases').insert({
      ...parsed.data,
      amount: Number(parsed.data.amount),
      released_by: user?.id ?? null,
    })

    if (error) {
      redirect(`/payments/new?error=${encodeURIComponent(error.message)}`)
      return
    }

    redirect('/payments')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a href="/payments" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← Back to payments
      </a>
      <h1 className="text-2xl font-bold text-purple-900 mb-6 font-[family-name:var(--font-fira-code)]">
        New Payment Release
      </h1>
      <form action={createPayment} className="bg-white rounded-xl border border-purple-100 shadow-sm p-6 space-y-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-purple-700 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            id="project_id"
            name="project_id"
            required
            className="w-full rounded-md border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">Select a project...</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_number} — {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="check_number" label="Check Number" placeholder="e.g. 123456" />
          <Field name="voucher_number" label="Voucher Number" placeholder="e.g. V-2026-001" />
          <Field name="amount" label="Amount (PHP)" placeholder="50000" type="number" required />
          <SelectField name="status" label="Status" options={['Pending', 'Released', 'Cancelled']} defaultValue="Pending" required />
          <Field name="released_date" label="Release Date" type="date" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-purple-700 mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Optional notes..."
            className="w-full rounded-md border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
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
      <label htmlFor={name} className="block text-sm font-medium text-purple-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  )
}

function SelectField({ name, label, options, defaultValue, required = false }: {
  name: string; label: string; options: string[]; defaultValue?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-purple-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-purple-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
