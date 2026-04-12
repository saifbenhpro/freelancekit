import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AppBar, Box, Button, Container, Toolbar, Typography, Avatar } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from '@/contexts/AuthContext'

const NAV = [
  { label: 'Devis', path: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 17 }} /> },
  { label: 'Clients', path: '/clients', icon: <PeopleIcon sx={{ fontSize: 17 }} /> },
  { label: 'Profil', path: '/profile', icon: <PersonIcon sx={{ fontSize: 17 }} /> },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default">
        <Toolbar sx={{ gap: 1 }}>
          {/* Logo */}
          <Box
            display="flex" alignItems="center" gap={1}
            sx={{ cursor: 'pointer', mr: 3 }}
            onClick={() => navigate('/dashboard')}
          >
            <Box sx={{
              width: 32, height: 32, borderRadius: 2,
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>
              💸
            </Box>
            <Typography fontWeight={700} fontSize={16} color="text.primary">
              FreelanceKit
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            {NAV.map((item) => {
              const active = pathname.startsWith(item.path)
              return (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  size="small"
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'primary.light' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    px: 1.5,
                    '&:hover': { bgcolor: active ? 'primary.light' : 'grey.100' },
                  }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Box>

          {/* User */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 13 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {user?.name}
            </Typography>
            <Button
              size="small"
              onClick={() => { logout(); navigate('/login') }}
              sx={{ color: 'text.secondary', fontWeight: 500 }}
            >
              Déconnexion
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
