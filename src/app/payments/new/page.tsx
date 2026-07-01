import { redirect } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { FormSection, FormShell, Field } from '@/components/forms'
import { MultipleProjectPaymentItems } from '@/components/payments/multiple-project-payment-items'
import { Textarea } from '@/components/ui/textarea'
import { paymentBatchSchema } from '@/lib/validations/payment'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { createPaymentReleaseBatch } from '@/lib/releases/payment-release-batch'
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

    const rows = createPaymentReleaseBatch({ input: parsed.data, releasedBy: user.id })

    const { error } = await supabase.from('payment_releases').insert(rows)

    if (error) {
      await setFlash('error', error.message)
      redirect('/payments/new')
    }

    await setFlash(
      'success',
      `${rows.length} payment allocation${rows.length === 1 ? '' : 's'} created successfully.`,
    )
    redirect('/payments')
  }

  return (
    <FormShell
      action={createPayment}
      backHref="/payments"
      backLabel="Back to payments"
      breadcrumbs={<Breadcrumbs items={[{ label: 'Payments', href: '/payments' }, { label: 'New Payment' }]} />}
      description="Release one shared check or voucher across multiple project allocations."
      submitHint="Add at least one project and a positive amount before submitting."
      submitLabel="Create Payment"
      title="New Payment Release"
    >
      <input type="hidden" name="status" value="Released" />

      <FormSection
        title="Release details"
        description="These values are shared by every project allocation below. Status is fixed to Released on creation."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field name="check_number" label="Check Number" placeholder="e.g. 123456" />
          <Field name="voucher_number" label="Voucher Number" placeholder="e.g. 123456" />
          <Field name="released_date" label="Release Date" type="date" defaultValue={today} />
        </div>
      </FormSection>

      <MultipleProjectPaymentItems projects={projects ?? []} />

      <FormSection title="Notes" description="Optional context that applies to the whole payment batch.">
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
            Notes
          </label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Optional notes..." />
        </div>
      </FormSection>
    </FormShell>
  )
}
