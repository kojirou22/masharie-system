import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { expenseSchema } from '@/lib/validations/expense'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import type { PaymentStatus, AccountType } from '@/lib/types/database'

export default async function NewExpensePage() {
  await requireAdmin()

  async function createExpense(formData: FormData) {
    'use server'

    const { supabase, user } = await requireAdmin()

    const raw = {
      date: formData.get('date') as string,
      check_number: formData.get('check_number') as string,
      voucher_number: formData.get('voucher_number') as string,
      amount: formData.get('amount') as string,
      purpose: formData.get('purpose') as string,
      requested_by: formData.get('requested_by') as string,
      account_type: formData.get('account_type') as AccountType,
      status: formData.get('status') as PaymentStatus,
    }

    const parsed = expenseSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      await setFlash('error', errors)
      redirect('/expenses/new')
    }

    const { error } = await supabase.from('expenses').insert({
      ...parsed.data,
      amount: Number(parsed.data.amount),
      created_by: user.id,
    })

    if (error) {
      await setFlash('error', error.message)
      redirect('/expenses/new')
    }

    await setFlash('success', 'Expense created successfully.')
    redirect('/expenses')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'Expenses', href: '/expenses' }, { label: 'New Expense' }]} />
      <Link href="/expenses" className="text-sm text-blue-700 hover:underline mb-4 inline-block">
        ← Back to expenses
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-mono">
        New Expense
      </h1>
      <form action={createExpense} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="date" label="Date" type="date" required />
          <Field name="check_number" label="Check Number" placeholder="e.g. 123456" required />
          <Field name="voucher_number" label="Voucher Number" placeholder="e.g. V-2026-001" required />
          <Field name="amount" label="Amount (PHP)" placeholder="10000" type="number" required />
          <Field name="purpose" label="Purpose" placeholder="Office supplies" required />
          <Field name="requested_by" label="Requested By" placeholder="John Doe" required />
          <SelectField name="account_type" label="Account Type" options={['Project Account', 'Expenses Account', 'Savings Account']} required />
          <SelectField name="status" label="Status" options={['Released', 'Cancelled']} defaultValue="Released" required />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Create Expense
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
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
