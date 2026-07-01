import { notFound, redirect } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { FormSection, FormShell, Field, SelectField } from '@/components/forms'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { expenseSchema } from '@/lib/validations/expense'
import { formatPHP } from '@/lib/utils/currency'
import type { AccountType, PaymentStatus } from '@/lib/types/database'

const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['Project Account', 'Expenses Account', 'Savings Account']
const EXPENSE_STATUS_OPTIONS: PaymentStatus[] = ['Released', 'Cancelled']

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !expense) notFound()

  async function updateExpense(formData: FormData) {
    'use server'

    const { supabase } = await requireAdmin()

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
      const errors = parsed.error.issues.map((issue) => issue.message).join(', ')
      await setFlash('error', errors)
      redirect(`/expenses/${id}/edit`)
    }

    const { error } = await supabase
      .from('expenses')
      .update({
        ...parsed.data,
        amount: Number(parsed.data.amount),
      })
      .eq('id', id)

    if (error) {
      await setFlash('error', error.message)
      redirect(`/expenses/${id}/edit`)
    }

    await setFlash('success', 'Expense updated successfully.')
    redirect('/expenses')
  }

  return (
    <FormShell
      action={updateExpense}
      backHref="/expenses"
      backLabel="Back to expenses"
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: 'Expenses', href: '/expenses' },
            { label: expense.check_number },
            { label: 'Edit' },
          ]}
        />
      }
      description="Adjust one expense row while preserving the existing submit contract."
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{expense.status}</Badge>
          <Badge variant="secondary">{formatPHP(Number(expense.amount))}</Badge>
        </div>
      }
      submitLabel="Save Changes"
      title="Edit Expense Release"
    >
      <FormSection
        title="Expense purpose"
        description="Update the individual purpose, requester, and amount for this expense row."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_180px]">
          <Field name="purpose" label="Purpose" defaultValue={expense.purpose} required />
          <Field name="requested_by" label="Requested By" defaultValue={expense.requested_by} required />
          <Field name="amount" label="Amount (PHP)" type="number" defaultValue={String(expense.amount)} required />
        </div>
      </FormSection>

      <FormSection
        title="Release details"
        description="Date, check number, voucher number, account, and lifecycle status for this expense."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field name="date" label="Date" type="date" defaultValue={expense.date} required />
          <Field name="check_number" label="Check Number" defaultValue={expense.check_number} required />
          <Field name="voucher_number" label="Voucher Number" defaultValue={expense.voucher_number} required />
          <SelectField
            name="account_type"
            label="Account Type"
            options={ACCOUNT_TYPE_OPTIONS}
            defaultValue={expense.account_type}
            required
          />
          <SelectField
            name="status"
            label="Status"
            options={EXPENSE_STATUS_OPTIONS}
            defaultValue={expense.status}
            required
          />
        </div>
      </FormSection>
    </FormShell>
  )
}
