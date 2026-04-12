import { useState } from 'react'
import type { AxiosError } from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError(null)
      await authRegister(data.name, data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      setError(e.response?.data?.message ?? 'Une erreur est survenue')
    }
  }

  return (
    <Box minHeight="100vh" display="flex" bgcolor="background.default">
      {/* Left panel */}
      <Box
        flex={1} display={{ xs: 'none', md: 'flex' }}
        flexDirection="column" justifyContent="center" alignItems="center"
        sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)' }}
      >
        <Box textAlign="center" color="white" px={6}>
          <Typography fontSize={48} mb={2}>💸</Typography>
          <Typography variant="h4" fontWeight={800} mb={1.5}>FreelanceKit</Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85 }}>
            Lancez-vous en quelques minutes
          </Typography>
        </Box>
      </Box>

      {/* Right panel */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center" p={4}>
        <Box width="100%" maxWidth={400}>
          <Box display={{ xs: 'flex', md: 'none' }} alignItems="center" gap={1} mb={4} justifyContent="center">
            <Typography fontSize={28}>💸</Typography>
            <Typography fontWeight={800} fontSize={20}>FreelanceKit</Typography>
          </Box>

          <Typography variant="h5" mb={0.5}>Créer un compte</Typography>
          <Typography color="text.secondary" mb={4}>Commencez gratuitement, sans carte bancaire</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Paper elevation={1} sx={{ p: 3.5, borderRadius: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nom complet"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Mot de passe"
                type="password"
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button type="submit" fullWidth variant="contained" size="large"
                disabled={isSubmitting} sx={{ mt: 1, py: 1.5 }}>
                {isSubmitting ? 'Création…' : 'Créer mon compte'}
              </Button>
            </Box>
          </Paper>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
