import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Quote } from '@/types'
import { lineTotal, quoteSubtotal, quoteTTC } from '@/types'


const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brand: { fontSize: 18, fontWeight: 'bold' },
  brandSub: { fontSize: 9, color: '#888', marginTop: 2 },
  quoteRef: { textAlign: 'right' },
  quoteNumber: { fontSize: 13, fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
  statusBadge: { fontSize: 8, color: '#555', marginTop: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginVertical: 16 },
  section: { marginBottom: 20 },
  label: { fontSize: 8, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  clientName: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  meta: { flexDirection: 'row', gap: 32, marginBottom: 24 },
  metaItem: { marginRight: 32 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: '6 8',
    borderRadius: 2,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'right' },
  colUnit: { width: 80, textAlign: 'right' },
  colTotal: { width: 80, textAlign: 'right' },
  th: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#555' },
  totals: { alignItems: 'flex-end', marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  totalLabel: { width: 120, color: '#555', textAlign: 'right', marginRight: 16 },
  totalValue: { width: 80, textAlign: 'right' },
  grandTotalLabel: { width: 120, textAlign: 'right', marginRight: 16, fontFamily: 'Helvetica-Bold', fontSize: 11 },
  grandTotalValue: { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 11 },
  note: { marginTop: 24, padding: 10, backgroundColor: '#fafafa', borderRadius: 2 },
  noteLabel: { fontSize: 8, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  noteText: { fontSize: 9, color: '#555', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, textAlign: 'center', fontSize: 8, color: '#aaa' },
})

interface Props {
  quote: Quote
}

export default function QuotePDF({ quote }: Props) {
  const subtotal = quoteSubtotal(quote.lines)
  const taxAmount = subtotal * quote.taxRate / 100
  const total = quoteTTC(quote.lines, quote.taxRate)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>💸 FreelanceKit</Text>
            <Text style={s.brandSub}>Générateur de devis</Text>
          </View>
          <View style={s.quoteRef}>
            <Text style={s.quoteNumber}>{quote.number}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Client */}
        <View style={s.section}>
          <Text style={s.label}>Adressé à</Text>
          <Text style={s.clientName}>{quote.client.name}</Text>
          {quote.client.email && <Text style={{ color: '#555', marginTop: 2 }}>{quote.client.email}</Text>}
          {quote.client.address && <Text style={{ color: '#555', marginTop: 2 }}>{quote.client.address}</Text>}
        </View>

        {/* Meta */}
        <View style={s.meta}>
          <View style={s.metaItem}>
            <Text style={s.label}>Date</Text>
            <Text>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</Text>
          </View>
          {quote.validUntil && (
            <View style={s.metaItem}>
              <Text style={s.label}>Valide jusqu'au</Text>
              <Text>{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Text style={s.label}>TVA</Text>
            <Text>{quote.taxRate}%</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={[s.th, s.colDesc]}>Description</Text>
          <Text style={[s.th, s.colQty]}>Qté</Text>
          <Text style={[s.th, s.colUnit]}>Prix unit. HT</Text>
          <Text style={[s.th, s.colTotal]}>Total HT</Text>
        </View>

        {/* Lines */}
        {quote.lines.sort((a, b) => a.order - b.order).map((line, i) => (
          <View key={i}>
            <View style={s.tableRow}>
              <View style={s.colDesc}>
                <Text>{line.description}</Text>
                {line.detail ? <Text style={{ fontSize: 8, color: '#888', marginTop: 2 }}>{line.detail}</Text> : null}
              </View>
              <Text style={s.colQty}>{line.quantity}{line.unit ? ` ${line.unit}` : ''}</Text>
              <Text style={s.colUnit}>{fmt(line.unitPrice)}</Text>
              {line.discount > 0 && <Text style={[s.colUnit, { fontSize: 8, color: '#d97706' }]}>-{line.discount}%</Text>}
              <Text style={s.colTotal}>{fmt(lineTotal(line))}</Text>
            </View>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sous-total HT</Text>
            <Text style={s.totalValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TVA ({quote.taxRate}%)</Text>
            <Text style={s.totalValue}>{fmt(taxAmount)}</Text>
          </View>
          <View style={[s.divider, { width: 200, marginVertical: 6 }]} />
          <View style={s.totalRow}>
            <Text style={s.grandTotalLabel}>Total TTC</Text>
            <Text style={s.grandTotalValue}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Note */}
        {quote.note && (
          <View style={s.note}>
            <Text style={s.noteLabel}>Note</Text>
            <Text style={s.noteText}>{quote.note}</Text>
          </View>
        )}

        <Text style={s.footer}>Document généré par FreelanceKit</Text>
      </Page>
    </Document>
  )
}
