import { useAuthContext } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const ProtectedRoute = () => {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  // Guardar la ruta destino antes de redirigir al login
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname)
    }
  }, [loading, user, location.pathname])

  // Mostrar skeleton mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#EA0A2A] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  // Si hay usuario autenticado, renderizar las rutas hijas
  return <Outlet />
}