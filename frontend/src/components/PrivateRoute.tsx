import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function PrivateRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
