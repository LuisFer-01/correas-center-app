import { AdminHeader } from '@/admin/components/AdminHeader'
import { AdminProvider } from '@/providers/AdminProvider'
import {
  Building2,
  FileText,
  Home,
  Mail,
  Package,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// Definición de items del sidebar
const sidebarItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: Home,
    end: true,
  },
  {
    to: '/admin/usuarios',
    label: 'Usuarios',
    icon: Users,
    disabled: true,
  },
  {
    to: '/admin/productos',
    label: 'Productos',
    icon: Package,
    disabled: true,
  },
  {
    to: '/admin/servicios',
    label: 'Servicios',
    icon: Wrench,
    disabled: true,
  },
  {
    to: '/admin/contactos',
    label: 'Contactos',
    icon: Mail,
    disabled: true,
  },
  {
    to: '/admin/empresas',
    label: 'Empresas',
    icon: Building2,
    disabled: true,
  },
  {
    to: '/admin/auditoria',
    label: 'Auditoría',
    icon: FileText,
    disabled: true,
  },
  {
    to: '/admin/configuracion',
    label: 'Configuración',
    icon: Settings,
    disabled: true,
  },
]

export const AdminLayout = () => {
  const location = useLocation()

  // Ocultar sidebar en la página de login
  const isLoginPage = location.pathname === '/admin/login'

  // ✅ NUEVO: Limpiar dark mode al salir del admin
  useEffect(() => {
    return () => {
      // Cuando el componente se desmonta (usuario sale del admin)
      // Remover la clase dark para no afectar al sitio público
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isLoginPage ? (
          // En login, solo renderizar el outlet sin layout
          <Outlet />
        ) : (
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex dark:border-gray-700 dark:bg-gray-800">
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.end
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to)

                    if (item.disabled) {
                      return (
                        <div
                          key={item.to}
                          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500"
                          title="Próximamente"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                      )
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#EA0A2A] text-white'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              {/* Footer del sidebar */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Correas Center Admin
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  v1.0.0
                </p>
              </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex flex-1 flex-col">
              <AdminHeader />
              <main className="flex-1 p-6 md:p-8">
                <Outlet />
              </main>
            </div>
          </div>
        )}
      </div>
    </AdminProvider>
  )
}