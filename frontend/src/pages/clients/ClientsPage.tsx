import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BusinessIcon from '@mui/icons-material/Business'
import api from '@/lib/api'
import type { Client } from '@/types'
import SiretAutocomplete from '@/components/SiretAutocomplete'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  companyName: z.string().optional(),
  siret: z.string().max(14).optional(),
  email: z.string().email('Email invalide').or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const watched = watch()

  const load = () =>
    api.get<Client[]>('/clients').then(({ data }) => {
      setClients(data)
      setLoading(false)
    })

  useEffect(() => { void load() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', companyName: '', siret: '', email: '', phone: '', address: '' })
    setDialogOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    reset({
      name: c.name,
      companyName: c.companyName ?? '',
      siret: c.siret ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      email: data.email || undefined,
      siret: data.siret || undefined,
      companyName: data.companyName || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    }
    if (editing) {
      await api.patch(`/clients/${editing.id}`, payload)
    } else {
      await api.post('/clients', payload)
    }
    setDialogOpen(false)
    void load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return
    await api.delete(`/clients/${id}`)
    void load()
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5">Clients</Typography>
          <Typography variant="body2" color="text.secondary">{clients.length} client{clients.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nouveau client
        </Button>
      </Box>

      {clients.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }} elevation={1}>
          <BusinessIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary" mb={2}>Aucun client pour l'instant</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
            Ajouter mon premier client
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase' } }}>
                <TableCell>Nom / Société</TableCell>
                <TableCell>SIRET</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                    {c.companyName && <Typography variant="caption" color="text.secondary">{c.companyName}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">{c.siret ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {c.email && <Typography variant="body2">{c.email}</Typography>}
                    {c.phone && <Typography variant="caption" color="text.secondary">{c.phone}</Typography>}
                    {!c.email && !c.phone && '—'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.address ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {!editing && (
              <>
                <SiretAutocomplete
                  onSelect={({ companyName, siret, address }) => {
                    setValue('companyName', companyName)
                    setValue('siret', siret)
                    setValue('address', address)
                    if (!editing) setValue('name', companyName)
                  }}
                />
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">ou remplir manuellement</Typography>
                </Divider>
              </>
            )}

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Nom du contact *"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputLabelProps={{ shrink: !!watched.name }}
              />
              <TextField
                label="Nom de la société"
                {...register('companyName')}
                InputLabelProps={{ shrink: !!watched.companyName }}
              />
              <TextField
                label="SIRET"
                inputProps={{ maxLength: 14 }}
                {...register('siret')}
                InputLabelProps={{ shrink: !!watched.siret }}
              />
              <TextField
                label="Téléphone"
                {...register('phone')}
                InputLabelProps={{ shrink: !!watched.phone }}
              />
              <TextField
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{ shrink: !!watched.email }}
              />
            </Box>
            <TextField
              label="Adresse"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
              {...register('address')}
              InputLabelProps={{ shrink: !!watched.address }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
