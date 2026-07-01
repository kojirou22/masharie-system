import { notFound, redirect } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { FormSection, FormShell, Field, ProjectSelect, SelectField } from '@/components/forms'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { requireAdmin } from '@/lib/auth/admin'
import { setFlash } from '@/lib/flash'
import { paymentSchema } from '@/lib/validations/payment'
import { formatPHP } from '@/lib/utils/currency'
import { arabicTextClass } from '@/lib/utils/formatters'
import type { PaymentStatus } from '@/lib/types/database'

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['Pending', 'Released', 'Cancelled']

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
    <FormShell
      action={updatePayment}
      backHref="/payments"
      backLabel="Back to payments"
      breadcrumbs={(
        <Breadcrumbs
          items={[
            { label: 'Payments', href: '/payments' },
            { label: payment.project?.project_number ?? 'Payment' },
            { label: 'Edit' },
          ]}
        />
      )}
      description="Adjust one payment allocation while keeping the release field contract intact."
      meta={(
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{payment.status}</Badge>
          <Badge variant="secondary">{formatPHP(Number(payment.amount))}</Badge>
        </div>
      )}
      submitHint={(
        <>
          Fields marked <span className="text-destructive">*</span> are required.
        </>
      )}
      submitLabel="Save Changes"
      title="Edit Payment Release"
    >
      <FormSection
        title="Project allocation"
        description="Select the project this release row belongs to and confirm the released amount."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]">
          <ProjectSelect projects={projects ?? []} defaultValue={payment.project_id} />
          <Field name="amount" label="Amount (PHP)" type="number" defaultValue={String(payment.amount)} required />
        </div>
        {payment.project && (
          <div className="mt-3 rounded-xl border border-border/80 bg-muted/35 px-3 py-2 text-sm">
            <span className="font-mono text-xs font-medium text-primary">{payment.project.project_number}</span>{' '}
            <span className={arabicTextClass(payment.project.name)}>{payment.project.name}</span>
          </div>
        )}
      </FormSection>

      <FormSection
        title="Release details"
        description="Check number, voucher, date, and lifecycle status for this allocation."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field name="check_number" label="Check Number" defaultValue={payment.check_number ?? ''} />
          <Field name="voucher_number" label="Voucher Number" defaultValue={payment.voucher_number ?? ''} />
          <SelectField name="status" label="Status" options={PAYMENT_STATUS_OPTIONS} defaultValue={payment.status} required />
          <Field name="released_date" label="Release Date" type="date" defaultValue={payment.released_date ?? ''} />
        </div>
      </FormSection>

      <FormSection title="Notes" description="Optional context attached to this payment row.">
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
            Notes
          </label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={payment.notes ?? ''}
            placeholder="Optional notes..."
          />
        </div>
      </FormSection>
    </FormShell>
  )
}
