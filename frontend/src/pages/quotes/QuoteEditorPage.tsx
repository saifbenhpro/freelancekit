import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Divider, FormControl, FormHelperText, IconButton, InputLabel,
  MenuItem, Paper, Select, TextField, Tooltip, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShareIcon from '@mui/icons-material/Share'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '@/lib/api'
import type { Client, Quote, QuoteStatus } from '@/types'
import { STATUS_LABELS, UNITS, lineTotal } from '@/types'
import DownloadPDFButton from '@/components/DownloadPDFButton'

const lineSchema = z.object({
  description: z.string().min(1, 'Requis'),
  detail: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).max(100).optional(),
})

const schema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  taxRate: z.number().min(0).max(100),
  validUntil: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REFUSED']).optional(),
  lines: z.array(lineSchema).min(1),
})
type FormData = z.infer<typeof schema>

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

// Sortable row component
function SortableRow({ id, children }: { id: string; children: (dragHandle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <Box ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        bgcolor: isDragging ? 'primary.light' : 'transparent',
        borderRadius: 2,
      }}
    >
      {children(
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: 'text.disabled', display: 'flex', alignItems: 'center', px: 0.5, '&:active': { cursor: 'grabbing' } }}>
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}
    </Box>
  )
}

export default function QuoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [loadedQuote, setLoadedQuote] = useState<Quote | null>(null)

  const { control, register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: '', taxRate: 20, validUntil: '', note: '', status: 'DRAFT',
      lines: [{ description: '', detail: '', quantity: 1, unit: 'h', unitPrice: 0, discount: 0 }],
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'lines' })
  const watchLines = watch('lines')
  const watchTax = watch('taxRate')

  const subtotal = (watchLines ?? []).reduce(
    (s, l) => s + lineTotal({ quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0, discount: Number(l.discount) || 0 }),
    0,
  )
  const taxAmount = subtotal * (Number(watchTax) || 0) / 100
  const total = subtotal + taxAmount

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const from = fields.findIndex((f) => f.id === active.id)
      const to = fields.findIndex((f) => f.id === over.id)
      move(from, to)
    }
  }

  useEffect(() => {
    const loadClients = api.get<Client[]>('/clients')
    const loadQuote = isEdit ? api.get<Quote>(`/quotes/${id}`) : Promise.resolve(null)
    Promise.all([loadClients, loadQuote])
      .then(([{ data: c }, qRes]) => {
        setClients(c)
        if (qRes?.data) {
          const q = qRes.data
          setQuoteNumber(q.number)
          setLoadedQuote(q)
          if (q.shareToken) setShareToken(q.shareToken)
          reset({
            clientId: q.clientId, taxRate: q.taxRate,
            validUntil: q.validUntil ? q.validUntil.slice(0, 10) : '',
            note: q.note ?? '', status: q.status,
            lines: q.lines
              .sort((a, b) => a.order - b.order)
              .map((l) => ({
                description: l.description, detail: l.detail ?? '',
                quantity: l.quantity, unit: l.unit || 'h',
                unitPrice: l.unitPrice, discount: l.discount ?? 0,
              })),
          })
        }
        setLoading(false)
      })
      .catch(() => { setError('Erreur chargement'); setLoading(false) })
  }, [id, isEdit, reset])

  const handleShare = async () => {
    const { data } = await api.post<{ shareToken: string }>(`/quotes/${id}/share-token`)
    setShareToken(data.shareToken)
    await navigator.clipboard.writeText(`${window.location.origin}/preview/${data.shareToken}`)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 3000)
  }

  const onSubmit = async (data: FormData) => {
    try {
      setError(null)
      const payload = {
        ...data,
        validUntil: data.validUntil || undefined,
        note: data.note || undefined,
        lines: data.lines.map((l, i) => ({ ...l, order: i })),
      }
      if (isEdit) {
        const { data: updated } = await api.patch<Quote>(`/quotes/${id}`, payload)
        setLoadedQuote(updated)
      } else {
        await api.post('/quotes', payload)
      }
      navigate('/dashboard')
    } catch { setError('Erreur lors de la sauvegarde') }
  }

  const currentQuoteForPDF = loadedQuote ? {
    ...loadedQuote,
    status: watch('status') ?? loadedQuote.status,
    taxRate: watch('taxRate') ?? loadedQuote.taxRate,
    note: watch('note') ?? loadedQuote.note,
    validUntil: watch('validUntil') || loadedQuote.validUntil,
    lines: (watch('lines') ?? loadedQuote.lines).map((l, i) => ({
      ...loadedQuote.lines[i] ?? {},
      id: loadedQuote.lines[i]?.id ?? `tmp-${i}`,
      quoteId: loadedQuote.id,
      description: l.description,
      detail: l.detail,
      quantity: Number(l.quantity),
      unit: l.unit ?? 'h',
      unitPrice: Number(l.unitPrice),
      discount: Number(l.discount) ?? 0,
      order: i,
    })),
  } : null

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h5">{isEdit ? `Devis ${quoteNumber}` : 'Nouveau devis'}</Typography>
          {isEdit && loadedQuote && (
            <Chip label={STATUS_LABELS[loadedQuote.status]} size="small"
              color={loadedQuote.status === 'ACCEPTED' ? 'success' : loadedQuote.status === 'SENT' ? 'info' : loadedQuote.status === 'REFUSED' ? 'error' : 'default'}
              sx={{ mt: 0.5 }} />
          )}
        </Box>
        {isEdit && currentQuoteForPDF && (
          <Box display="flex" gap={1}>
            <DownloadPDFButton quote={currentQuoteForPDF} />
            <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}
              color={copySuccess ? 'success' : 'inherit'}>
              {copySuccess ? 'Lien copié !' : shareToken ? 'Copier le lien' : 'Générer un lien'}
            </Button>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={3}>
        {/* Infos */}
        <Paper sx={{ p: 3 }} elevation={1}>
          <Typography variant="subtitle1" mb={2.5}>Informations</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <FormControl error={!!errors.clientId} fullWidth>
              <InputLabel>Client *</InputLabel>
              <Controller name="clientId" control={control}
                render={({ field }) => (
                  <Select {...field} label="Client *">
                    {clients.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                )} />
              {errors.clientId && <FormHelperText>{errors.clientId.message}</FormHelperText>}
            </FormControl>

            {isEdit && (
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Controller name="status" control={control}
                  render={({ field }) => (
                    <Select {...field} label="Statut">
                      {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map((s) => (
                        <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                      ))}
                    </Select>
                  )} />
              </FormControl>
            )}

            <TextField label="Date de validité" type="date" InputLabelProps={{ shrink: true }}
              {...register('validUntil')} />
            <TextField label="Taux de TVA (%)" type="number"
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              {...register('taxRate', { valueAsNumber: true })}
              error={!!errors.taxRate} helperText={errors.taxRate?.message} />
          </Box>
          <TextField label="Note / conditions" multiline rows={2} fullWidth sx={{ mt: 2 }}
            placeholder="Conditions de paiement, délais, mentions légales…"
            {...register('note')} />
        </Paper>

        {/* Lignes */}
        <Paper sx={{ p: 3 }} elevation={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="subtitle1">Lignes du devis</Typography>
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => append({ description: '', detail: '', quantity: 1, unit: 'h', unitPrice: 0, discount: 0 })}>
              Ajouter une ligne
            </Button>
          </Box>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {fields.map((field, i) => {
                  const lt = lineTotal({
                    quantity: Number(watchLines[i]?.quantity) || 0,
                    unitPrice: Number(watchLines[i]?.unitPrice) || 0,
                    discount: Number(watchLines[i]?.discount) || 0,
                  })
                  return (
                    <SortableRow key={field.id} id={field.id}>
                      {(dragHandle) => (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Box display="flex" gap={1} alignItems="flex-start">
                            {dragHandle}
                            <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
                              {/* Row 1: description + total + delete */}
                              <Box display="flex" gap={1} alignItems="flex-start">
                                <TextField size="small" placeholder="Titre de la prestation *" fullWidth
                                  {...register(`lines.${i}.description`)}
                                  error={!!errors.lines?.[i]?.description}
                                  helperText={errors.lines?.[i]?.description?.message}
                                  sx={{ flex: 2 }}
                                />
                                <Box sx={{ minWidth: 100, textAlign: 'right', pt: 1 }}>
                                  <Typography variant="body2" fontWeight={700} color={lt > 0 ? 'text.primary' : 'text.disabled'}>
                                    {fmt(lt)}
                                  </Typography>
                                </Box>
                                <Tooltip title="Supprimer">
                                  <span>
                                    <IconButton size="small" color="error" disabled={fields.length === 1} onClick={() => remove(i)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>

                              {/* Row 2: detail */}
                              <TextField size="small" placeholder="Description détaillée (optionnel)"
                                multiline rows={1} fullWidth
                                {...register(`lines.${i}.detail`)}
                                sx={{ '& .MuiInputBase-root': { fontSize: 13, color: 'text.secondary' } }}
                              />

                              {/* Row 3: qty, unit, price, discount */}
                              <Box display="flex" gap={1} flexWrap="wrap">
                                <TextField size="small" label="Qté" type="number"
                                  inputProps={{ min: 0, step: 0.5 }}
                                  {...register(`lines.${i}.quantity`, { valueAsNumber: true })}
                                  error={!!errors.lines?.[i]?.quantity}
                                  sx={{ width: 80 }} />

                                <Controller name={`lines.${i}.unit`} control={control}
                                  render={({ field }) => (
                                    <Autocomplete freeSolo options={UNITS}
                                      value={field.value ?? ''}
                                      onInputChange={(_, v) => field.onChange(v)}
                                      onChange={(_, v) => field.onChange(v ?? '')}
                                      renderInput={(params) => (
                                        <TextField {...params} size="small" label="Unité" sx={{ width: 120 }} />
                                      )} />
                                  )} />

                                <TextField size="small" label="Prix unit. HT (€)" type="number"
                                  inputProps={{ min: 0, step: 0.01 }}
                                  {...register(`lines.${i}.unitPrice`, { valueAsNumber: true })}
                                  error={!!errors.lines?.[i]?.unitPrice}
                                  sx={{ width: 150 }} />

                                <TextField size="small" label="Remise (%)" type="number"
                                  inputProps={{ min: 0, max: 100, step: 1 }}
                                  {...register(`lines.${i}.discount`, { valueAsNumber: true })}
                                  sx={{ width: 110 }} />

                                {Number(watchLines[i]?.discount) > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Chip size="small" label={`-${watchLines[i].discount}%`} color="warning" />
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      )}
                    </SortableRow>
                  )
                })}
              </Box>
            </SortableContext>
          </DndContext>

          <Divider sx={{ my: 2.5 }} />

          {/* Totaux */}
          <Box display="flex" justifyContent="flex-end">
            <Box minWidth={300} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" justifyContent="space-between" px={1}>
                <Typography variant="body2" color="text.secondary">Sous-total HT</Typography>
                <Typography variant="body2" fontWeight={600}>{fmt(subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" px={1}>
                <Typography variant="body2" color="text.secondary">TVA ({watchTax}%)</Typography>
                <Typography variant="body2" fontWeight={600}>{fmt(taxAmount)}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box display="flex" justifyContent="space-between" px={1}
                sx={{ bgcolor: 'primary.light', borderRadius: 2, py: 1 }}>
                <Typography fontWeight={700} color="primary.main">Total TTC</Typography>
                <Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(total)}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} size="large">
            {isSubmitting ? 'Sauvegarde…' : isEdit ? 'Enregistrer' : 'Créer le devis'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
