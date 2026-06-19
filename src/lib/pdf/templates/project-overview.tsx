import { Text, View } from '@react-pdf/renderer'
import { PdfDocument, styles } from '@/lib/pdf/document'
import { formatPHP } from '@/lib/utils/currency'

export function ProjectOverviewPdf({ projects }: { projects: any[] }) {
  return (
    <PdfDocument title="Project Overview Report">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Projects</Text>
          <Text style={styles.statValue}>{projects.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Budget</Text>
          <Text style={styles.statValue}>
            {formatPHP(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Projects</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Project #</Text>
          <Text style={styles.tableCellHeader}>Name</Text>
          <Text style={styles.tableCellHeader}>Donor</Text>
          <Text style={styles.tableCellHeader}>Type</Text>
          <Text style={styles.tableCellHeader}>Status</Text>
          <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Budget</Text>
        </View>
        {projects.map((p) => (
          <View key={p.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{p.project_number}</Text>
            <Text style={styles.tableCell}>{p.name}</Text>
            <Text style={styles.tableCell}>{p.donor}</Text>
            <Text style={styles.tableCell}>{p.type}</Text>
            <Text style={styles.tableCell}>{p.status}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>{formatPHP(p.budget)}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  )
}
