import { Text, View } from '@react-pdf/renderer'
import { PdfDocument, styles } from '@/lib/pdf/document'
import { formatPHP } from '@/lib/utils/currency'

export function BudgetSummaryPdf({ projects, stats }: { projects: any[]; stats: any }) {
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalReleased = projects.reduce((sum, p) => {
    const released = (p.payment_releases || [])
      .filter((pay: any) => pay.status === 'Released')
      .reduce((s: number, pay: any) => s + (pay.amount || 0), 0)
    return sum + released
  }, 0)

  return (
    <PdfDocument title="Budget Summary Report">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Projects</Text>
          <Text style={styles.statValue}>{stats.total_projects}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active Projects</Text>
          <Text style={styles.statValue}>{stats.active_projects}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Budget</Text>
          <Text style={styles.statValue}>{formatPHP(totalBudget)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Released</Text>
          <Text style={styles.statValue}>{formatPHP(totalReleased)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={styles.statValue}>{formatPHP(totalBudget - totalReleased)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Breakdown</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Project #</Text>
          <Text style={styles.tableCellHeader}>Name</Text>
          <Text style={styles.tableCellHeader}>Type</Text>
          <Text style={styles.tableCellHeader}>Status</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Budget</Text>
        </View>
        {projects.map((p) => (
          <View key={p.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{p.project_number}</Text>
            <Text style={styles.tableCell}>{p.name}</Text>
            <Text style={styles.tableCell}>{p.type}</Text>
            <Text style={styles.tableCell}>{p.status}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatPHP(p.budget)}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  )
}
