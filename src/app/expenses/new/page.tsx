import { redirect } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { FormSection, FormShell, Field, SelectField } from '@/components/forms'
import { MultipleExpenseItems } from '@/components/expenses/multiple-expense-items'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { createExpenseReleaseBatch } from '@/lib/releases/expense-release-batch'
import { expenseBatchSchema } from '@/lib/validations/expense'
import type { AccountType, PaymentStatus } from '@/lib/types/database'

const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['Project Account', 'Expenses Account', 'Savings Account']

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default async function NewExpensePage() {
  await requireAdmin()
  const today = getTodayDateInputValue()

  async function createExpense(formData: FormData) {
    'use server'

    const { supabase, user } = await requireAdmin()
    const purposes = formData.getAll('purpose').map(String)
    const requestedBy = formData.getAll('requested_by').map(String)
    const amounts = formData.getAll('amount').map(String)

    const raw = {
      date: formData.get('date') as string,
      check_number: formData.get('check_number') as string,
      voucher_number: formData.get('voucher_number') as string,
      account_type: formData.get('account_type') as AccountType,
      status: formData.get('status') as PaymentStatus,
      line_items: purposes.map((purpose, index) => ({
        purpose,
        requested_by: requestedBy[index],
        amount: amounts[index],
      })),
    }

    const parsed = expenseBatchSchema.safeParse(raw)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ')
      await setFlash('error', errors)
      redirect('/expenses/new')
    }

    const rows = createExpenseReleaseBatch({ input: parsed.data, createdBy: user.id })

    const { error } = await supabase.from('expenses').insert(rows)

    if (error) {
      await setFlash('error', error.message)
      redirect('/expenses/new')
    }

    await setFlash(
      'success',
      `${rows.length} expense item${rows.length === 1 ? '' : 's'} created successfully.`,
    )
    redirect('/expenses')
  }

  return (
    <FormShell
      action={createExpense}
      backHref="/expenses"
      backLabel="Back to expenses"
      breadcrumbs={<Breadcrumbs items={[{ label: 'Expenses', href: '/expenses' }, { label: 'New Expense' }]} />}
      description="Record one shared expense check or voucher across multiple purposes."
      submitHint="Add at least one purpose, requester, and positive amount before submitting."
      submitLabel="Create Expense"
      title="New Expense Release"
    >
      <input type="hidden" name="status" value="Released" />

      <FormSection
        title="Release details"
        description="These values are shared by every expense purpose below. Status is fixed to Released on creation."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field name="date" label="Date" type="date" defaultValue={today} required />
          <Field name="check_number" label="Check Number" placeholder="e.g. 123456" required />
          <Field name="voucher_number" label="Voucher Number" placeholder="e.g. 123456" required />
          <SelectField name="account_type" label="Account Type" options={ACCOUNT_TYPE_OPTIONS} required />
        </div>
      </FormSection>

      <MultipleExpenseItems />
    </FormShell>
  )
}
