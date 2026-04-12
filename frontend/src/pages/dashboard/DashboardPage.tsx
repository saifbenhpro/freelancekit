import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Accordion, AccordionDetails, AccordionSummary,
  Avatar, Box, Button, Chip, CircularProgress,
  Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditNoteIcon from '@mui/icons-material/EditNote'
import api from '@/lib/api'
import type { Quote, Client } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, quoteTTC } from '@/types'

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

const AVATAR_COLORS = [
  '#2563eb', '#0ea5e9', '#7c3aed', '#db2777', '#059669', '#d97706',
]
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

interface ClientWithQuotes extends Client { quotes: Quote[] }

export default function DashboardPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Quote[]>('/quotes').then(({ data }) => {
      setQuotes(data)
      setLoading(false)
    })
  }, [])

  const clientMap = new Map<string, ClientWithQuotes>()
  quotes.forEach((q) => {
    if (!clientMap.has(q.clientId))
      clientMap.set(q.clientId, { ...q.client, quotes: [] })
    clientMap.get(q.clientId)!.quotes.push(q)
  })
  const clients = Array.from(clientMap.values())

  const totalCA = quotes
    .filter((q) => q.status === 'ACCEPTED')
    .reduce((s, q) => s + quoteTTC(q.lines, q.taxRate), 0)
  const pending = quotes.filter((q) => q.status === 'SENT').length
  const accepted = quotes.filter((q) => q.status === 'ACCEPTED').length
  const draft = quotes.filter((q) => q.status === 'DRAFT').length

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>

  const stats = [
    { label: 'CA accepté', value: fmt(totalCA), icon: <TrendingUpIcon />, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'En attente', value: pending, icon: <HourglassTopIcon />, color: '#d97706', bg: '#fffbeb' },
    { label: 'Acceptés', value: accepted, icon: <CheckCircleIcon />, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Brouillons', value: draft, icon: <EditNoteIcon />, color: '#64748b', bg: '#f8fafc' },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5">Tableau de bord</Typography>
          <Typography variant="body2" color="text.secondary">
            {quotes.length} devis · {clients.length} client{clients.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/quotes/new')}>
          Nouveau devis
        </Button>
      </Box>

      {/* Stats */}
      <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2} mb={4}
        sx={{ gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}
      >
        {stats.map((s) => (
          <Paper key={s.label} elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                  textTransform="uppercase" letterSpacing={0.5}>
                  {s.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} color={s.color} mt={0.5}>
                  {s.value}
                </Typography>
              </Box>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Suivi clients */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">Suivi par client</Typography>
      </Box>

      {clients.length === 0 ? (
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '2px dashed', borderColor: 'grey.200' }}>
          <EditNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography fontWeight={600} mb={0.5}>Aucun devis pour l'instant</Typography>
          <Typography color="text.secondary" variant="body2" mb={3}>
            Créez votre premier devis pour commencer le suivi
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/quotes/new')}>
            Créer un devis
          </Button>
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {clients.map((client) => {
            const sent = client.quotes.filter((q) => q.status === 'SENT').length
            const acc = client.quotes.filter((q) => q.status === 'ACCEPTED').length
            const tot = client.quotes.reduce((s, q) => s + quoteTTC(q.lines, q.taxRate), 0)
            const hasPending = sent > 0
            const color = avatarColor(client.name)

            return (
              <Accordion key={client.id} elevation={1} disableGutters
                sx={{
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  border: hasPending ? `1.5px solid #2563eb` : '1.5px solid transparent',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, py: 1 }}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Avatar sx={{ bgcolor: color, width: 40, height: 40, fontWeight: 700, fontSize: 16 }}>
                      {client.name[0].toUpperCase()}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography fontWeight={600} fontSize={15}>{client.name}</Typography>
                        {hasPending && <Chip label={`${sent} en attente`} color="warning" size="small" />}
                        {acc > 0 && <Chip label={`${acc} accepté${acc > 1 ? 's' : ''}`} color="success" size="small" />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {client.quotes.length} devis · {fmt(tot)} TTC
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Numéro</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell align="right">Montant TTC</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.quotes.map((q) => (
                          <TableRow key={q.id} hover sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/quotes/${q.id}`)}>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                                {q.number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={STATUS_LABELS[q.status]} color={STATUS_COLORS[q.status]} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700}>
                                {fmt(quoteTTC(q.lines, q.taxRate))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
