import { getSupabaseImageUrl } from '@/lib/supabase'
import { useAdminContext } from '@/providers/AdminProvider'
import { Building2, LogOut, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AdminHeader = () => {
  const { perfil, empresa, signOut } = useAdminContext()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  // Cargar preferencia de dark mode al montar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('adminDarkMode')
    const isDark = savedDarkMode === 'true'
    setIsDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('adminDarkMode', String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    await signOut()
    setShowUserMenu(false)
    navigate('/admin/login', { replace: true })
  }

  const handleGoToSite = () => {
    document.documentElement.classList.remove('dark')
    window.location.href = '/'
  }

  // Iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (perfil?.nombre_completo) {
      return perfil.nombre_completo
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
    return perfil?.email?.[0]?.toUpperCase() || 'U'
  }

  // ✅ NUEVO: Obtener URL del avatar
  const getAvatarUrl = () => {
    if (!perfil?.avatar_url) return null
    // Si ya es una URL completa (http/https), usarla directamente
    if (perfil.avatar_url.startsWith('http')) {
      return perfil.avatar_url
    }
    // Si es un path relativo, usar el helper de Supabase
    return getSupabaseImageUrl(perfil.avatar_url, 'avatars-usuarios')
  }

  const avatarUrl = getAvatarUrl()
  const showImage = avatarUrl && !avatarError

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gradient-to-r from-[#727272] to-[#333333]">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo: Logo empresa */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {empresa?.logo ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 dark:border-[#727272] dark:bg-[#727272]">
                <img
                  src={empresa.logo}
                  alt={empresa.nombre}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA0A2A] text-white">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {empresa?.nombre || 'Correas Center'}
              </h1>
              <p className="text-xs text-gray-300 dark:text-gray-200">
                Panel de Administración
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho: Dark mode + Usuario */}
        <div className="flex items-center gap-4">
          {/* Toggle Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Dropdown de Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {/* ✅ MEJORADO: Avatar con imagen o iniciales */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-[#EA0A2A] text-sm font-semibold text-white">
                {showImage ? (
                  <img
                    src={avatarUrl}
                    alt={perfil?.nombre_completo || 'Avatar'}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {perfil?.nombre_completo || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {perfil?.email || 'Sin email'}
                </p>
              </div>
            </button>

            {/* Menú desplegable */}
            {showUserMenu && (
              <>
                {/* Overlay para cerrar al hacer clic fuera */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {/* Header del menú con avatar grande */}
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-[#EA0A2A] text-white">
                        {showImage ? (
                          <img
                            src={avatarUrl}
                            alt={perfil?.nombre_completo || 'Avatar'}
                            className="h-full w-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {perfil?.nombre_completo || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {perfil?.email || 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleGoToSite}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Building2 className="h-4 w-4" />
                      Ver sitio público
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}