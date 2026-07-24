import {
  Building2,
  FileText,
  FolderBookmark,
  Home,
  Mail,
  Package,
  Settings,
  Store,
  Users,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface SidebarItem {
  to: string
  label: string
  icon: any
  end?: boolean
  disabled?: boolean
}

const sidebarItems: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Home, end: true },
  { to: '/admin/empresas', label: 'Empresas', icon: Building2, end: true },
  { to: '/admin/sucursales', label: 'Sucursales', icon: Store, end: true },
  { to: '/admin/marcas', label: 'Marcas', icon: FolderBookmark, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package, end: true },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, disabled: true },
  { to: '/admin/servicios', label: 'Servicios', icon: Wrench, disabled: true },
  { to: '/admin/contactos', label: 'Contactos', icon: Mail, disabled: true },
  { to: '/admin/auditoria', label: 'Auditoría', icon: FileText, disabled: true },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, disabled: true },
]

export const AdminSidebar = () => {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`hidden lg:flex flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)

            if (item.disabled) {
              return (
                <li key={item.to} className="relative group">
                  <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 dark:text-gray-400">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                        isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {/* Tooltip cuando está colapsado */}
                  {!isExpanded && (
                    <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      {item.label} (Próximamente)
                    </div>
                  )}
                </li>
              )
            }

            return (
              <li key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EA0A2A] text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>
                {/* Tooltip cuando está colapsado */}
                {!isExpanded && (
                  <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Correas Center Admin
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}