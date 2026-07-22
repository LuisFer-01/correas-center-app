import { useAdminContext } from '@/providers/AdminProvider'
import { Building2, LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AdminHeader = () => {
  const { perfil, empresa, signOut } = useAdminContext()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Cargar preferencia de dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
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
    localStorage.setItem('darkMode', String(newDarkMode))
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

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo: Logo empresa */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {empresa?.logo ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-600 dark:bg-gray-700">
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Dropdown de Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-1.5 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EA0A2A] text-sm font-semibold text-white">
                {getUserInitials()}
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
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {perfil?.nombre_completo || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {perfil?.email || 'Sin email'}
                    </p>
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