import { Text, View } from '@react-pdf/renderer'
import { PdfDocument, styles } from '@/lib/pdf/document'
import { formatPHP } from '@/lib/utils/currency'
import type { PaymentRelease } from '@/lib/types/database'

export function PaymentHistoryPdf({ payments }: { payments: Array<PaymentRelease & { project?: { project_number: string } | null }> }) {
  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <PdfDocument title="Payment History Report">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Payments</Text>
          <Text style={styles.statValue}>{payments.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Amount</Text>
          <Text style={styles.statValue}>{formatPHP(total)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Releases</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Project</Text>
          <Text style={styles.tableCellHeader}>Check #</Text>
          <Text style={styles.tableCellHeader}>Voucher #</Text>
          <Text style={styles.tableCellHeader}>Status</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Amount</Text>
        </View>
        {payments.map((p) => (
          <View key={p.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{p.project?.project_number ?? '—'}</Text>
            <Text style={styles.tableCell}>{p.check_number ?? '—'}</Text>
            <Text style={styles.tableCell}>{p.voucher_number ?? '—'}</Text>
            <Text style={styles.tableCell}>{p.status}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatPHP(p.amount)}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  )
}
