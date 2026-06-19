import { Text, View } from '@react-pdf/renderer'
import { PdfDocument, styles } from '@/lib/pdf/document'
import { formatPHP } from '@/lib/utils/currency'
import type { Expense } from '@/lib/types/database'

export function ExpenseBreakdownPdf({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <PdfDocument title="Expense Breakdown Report">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{expenses.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Amount</Text>
          <Text style={styles.statValue}>{formatPHP(total)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Details</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Date</Text>
          <Text style={styles.tableCellHeader}>Check #</Text>
          <Text style={styles.tableCellHeader}>Purpose</Text>
          <Text style={styles.tableCellHeader}>Account</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Amount</Text>
        </View>
        {expenses.map((e) => (
          <View key={e.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{e.date}</Text>
            <Text style={styles.tableCell}>{e.check_number}</Text>
            <Text style={styles.tableCell}>{e.purpose}</Text>
            <Text style={styles.tableCell}>{e.account_type}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatPHP(e.amount)}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  )
}
