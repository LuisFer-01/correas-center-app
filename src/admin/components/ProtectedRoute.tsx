import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setIsChecking(false)
    }
    checkAuth()
  }, [])

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}