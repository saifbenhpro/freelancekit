import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import api from '@/lib/api'
import type { UserProfile } from '@/types'
import SiretAutocomplete from '@/components/SiretAutocomplete'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  companyName: z.string().optional(),
  siret: z.string().max(14).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const watched = watch()

  useEffect(() => {
    api.get<UserProfile>('/profile').then(({ data }) => {
      setProfile(data)
      reset({
        name: data.name,
        companyName: data.companyName ?? '',
        siret: data.siret ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      })
      setLoading(false)
    })
  }, [reset])

  const onSubmit = async (data: FormData) => {
    const updated = await api.patch<UserProfile>('/profile', {
      ...data,
      siret: data.siret || undefined,
      companyName: data.companyName || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    })
    setProfile(updated.data)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  return (
    <Box maxWidth={640}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5">Mon profil</Typography>
          <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>Profil mis à jour</Alert>}

      <Paper sx={{ p: 4 }} elevation={1}>
        <Typography variant="subtitle2" color="text.secondary" mb={2} textTransform="uppercase" fontSize={11}>
          Infos entreprise
        </Typography>
        <SiretAutocomplete
          onSelect={({ companyName, siret, address }) => {
            setValue('companyName', companyName)
            setValue('siret', siret)
            setValue('address', address)
          }}
        />
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">ou remplir manuellement</Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              label="Nom complet *"
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
              placeholder="12345678901234"
              {...register('siret')}
              InputLabelProps={{ shrink: !!watched.siret }}
            />
            <TextField
              label="Téléphone"
              placeholder="+33 6 00 00 00 00"
              {...register('phone')}
              InputLabelProps={{ shrink: !!watched.phone }}
            />
          </Box>
          <TextField
            label="Adresse"
            fullWidth
            multiline
            rows={3}
            placeholder="1 rue de la Paix, 75001 Paris"
            {...register('address')}
            InputLabelProps={{ shrink: !!watched.address }}
          />

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Sauvegarde…' : 'Enregistrer'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
