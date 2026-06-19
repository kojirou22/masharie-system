import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/supabase/queries/dashboard'
import { getProjects } from '@/lib/supabase/queries/projects'
import { getPayments } from '@/lib/supabase/queries/payments'
import { getExpenses } from '@/lib/supabase/queries/expenses'
import { BudgetSummaryPdf } from '@/lib/pdf/templates/budget-summary'
import { PaymentHistoryPdf } from '@/lib/pdf/templates/payment-history'
import { ExpenseBreakdownPdf } from '@/lib/pdf/templates/expense-breakdown'
import { ProjectOverviewPdf } from '@/lib/pdf/templates/project-overview'
import { renderToBuffer } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'budget-summary'

  const supabase = await createClient()

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  // Fetch data
  const [stats, projects, payments, expenses] = await Promise.all([
    getDashboardStats(),
    getProjects({ pageSize: 1000 }),
    getPayments({ pageSize: 1000 }),
    getExpenses({ pageSize: 1000 }),
  ])

  let pdfDoc: ReactElement<DocumentProps>
  let filename: string

  switch (type) {
    case 'payment-history':
      pdfDoc = PaymentHistoryPdf({ payments: payments.data })
      filename = 'payment-history.pdf'
      break
    case 'expense-breakdown':
      pdfDoc = ExpenseBreakdownPdf({ expenses: expenses.data })
      filename = 'expense-breakdown.pdf'
      break
    case 'project-overview':
      pdfDoc = ProjectOverviewPdf({ projects: projects.data })
      filename = 'project-overview.pdf'
      break
    default:
      pdfDoc = BudgetSummaryPdf({ projects: projects.data, stats })
      filename = 'budget-summary.pdf'
  }

  const buffer = await renderToBuffer(pdfDoc)
  const uint8 = new Uint8Array(buffer)

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
