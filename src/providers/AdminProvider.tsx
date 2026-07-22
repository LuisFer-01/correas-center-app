import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

// Interfaces
interface Perfil {
  id: string
  nombre_completo: string
  email: string | null
  telefono: string | null
  avatar_url: string | null
  estado: string
}

interface Empresa {
  id: number
  nombre: string
  logo: string | null
}

interface AdminContextType {
  user: any
  perfil: Perfil | null
  empresa: Empresa | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshPerfil: () => Promise<void>
  refreshEmpresa: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carga separada del perfil
  const refreshPerfil = async () => {
    if (!user) {
      setPerfil(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, email, telefono, avatar_url, estado')
        .eq('id', user.id)
        .eq('estado', 'activo')
        .single()

      if (error) {
        console.error('Error cargando perfil:', error)
        setPerfil(null)
      } else {
        setPerfil(data as Perfil)
      }
    } catch (err) {
      console.error('Error en refreshPerfil:', err)
    }
  }

  // Carga separada de la empresa
  const refreshEmpresa = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre, logo')
        .eq('estado', 'activo')
        .limit(1)
        .single()

      if (error) {
        console.error('Error cargando empresa:', error)
        setEmpresa(null)
      } else {
        setEmpresa(data as Empresa)
      }
    } catch (err) {
      console.error('Error en refreshEmpresa:', err)
    }
  }

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!user) {
        setPerfil(null)
        setEmpresa(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Cargar ambos en paralelo (carga separada pero simultánea)
        await Promise.all([refreshPerfil(), refreshEmpresa()])
      } catch (err) {
        if (isMounted) {
          setError('Error al cargar datos del administrador')
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    setPerfil(null)
    setEmpresa(null)
  }

  return (
    <AdminContext.Provider
      value={{
        user,
        perfil,
        empresa,
        loading: authLoading || loading,
        error,
        signOut: handleSignOut,
        refreshPerfil,
        refreshEmpresa,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider')
  }
  return context
}