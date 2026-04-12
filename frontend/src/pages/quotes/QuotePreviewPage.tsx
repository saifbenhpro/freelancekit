import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import api from '@/lib/api'
import type { Quote } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, quoteSubtotal, quoteTTC } from '@/types'
import DownloadPDFButton from '@/components/DownloadPDFButton'

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

export default function QuotePreviewPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Quote>(`/quotes/public/${shareToken}`)
      .then(({ data }) => {
        setQuote(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [shareToken])

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    )

  if (error || !quote)
    return (
      <Box maxWidth={600} mx="auto" mt={10} px={2}>
        <Alert severity="error">Devis introuvable ou lien invalide.</Alert>
      </Box>
    )

  const subtotal = quoteSubtotal(quote.lines)
  const taxAmount = subtotal * quote.taxRate / 100
  const total = quoteTTC(quote.lines, quote.taxRate)

  return (
    <Box maxWidth={800} mx="auto" px={2} py={6}>
      <Paper sx={{ p: { xs: 3, sm: 5 } }} elevation={2}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>💸 FreelanceKit</Typography>
            <Typography variant="body2" color="text.secondary">Générateur de devis</Typography>
          </Box>
          <Box textAlign="right" display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Typography variant="h6" fontFamily="monospace">{quote.number}</Typography>
            <Chip
              label={STATUS_LABELS[quote.status]}
              color={STATUS_COLORS[quote.status]}
              size="small"
            />
            <DownloadPDFButton quote={quote} />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Client */}
        <Box mb={4}>
          <Typography variant="overline" color="text.secondary">Adressé à</Typography>
          <Typography variant="h6" fontWeight={600}>{quote.client.name}</Typography>
          {quote.client.email && (
            <Typography variant="body2" color="text.secondary">{quote.client.email}</Typography>
          )}
          {quote.client.address && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {quote.client.address}
            </Typography>
          )}
        </Box>

        <Box display="flex" gap={4} mb={4}>
          <Box>
            <Typography variant="overline" color="text.secondary">Date</Typography>
            <Typography variant="body2">
              {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
          {quote.validUntil && (
            <Box>
              <Typography variant="overline" color="text.secondary">Valide jusqu'au</Typography>
              <Typography variant="body2">
                {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Lines */}
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Qté</strong></TableCell>
              <TableCell align="right"><strong>Prix unit. HT</strong></TableCell>
              <TableCell align="right"><strong>Total HT</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quote.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.description}</TableCell>
                <TableCell align="right">{line.quantity}</TableCell>
                <TableCell align="right">{fmt(line.unitPrice)}</TableCell>
                <TableCell align="right">{fmt(line.quantity * line.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <Box display="flex" justifyContent="flex-end">
          <Box minWidth={280}>
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="text.secondary">Sous-total HT</Typography>
              <Typography variant="body2">{fmt(subtotal)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="body2" color="text.secondary">TVA ({quote.taxRate}%)</Typography>
              <Typography variant="body2">{fmt(taxAmount)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography variant="subtitle1" fontWeight={700}>Total TTC</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{fmt(total)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Note */}
        {quote.note && (
          <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="overline" color="text.secondary">Note</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
              {quote.note}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mt: 4, mb: 2 }} />
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          Document généré par FreelanceKit
        </Typography>
      </Paper>
    </Box>
  )
}
