import { usePermissions } from '@/hooks/usePermissions'
import {
  BookType,
  Building2,
  ChevronDown,
  Factory,
  FileText,
  FolderBookmark,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  List,
  Mail,
  Package,
  Settings,
  Shield,
  Store,
  Tag,
  TagIcon,
  Tags,
  Type,
  Users,
  Wand2,
  Wrench
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// ============================================================================
// INTERFACES
// ============================================================================
interface SidebarItem {
  to: string
  label: string
  icon: any
  end?: boolean
  permission?: string
}

interface SidebarGroup {
  label: string
  items: SidebarItem[]
}

// ============================================================================
// GRUPOS DEL SIDEBAR CON PERMISOS
// ============================================================================
const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '/admin', label: 'Dashboard', icon: Home, end: true },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { to: '/admin/empresas', label: 'Empresas', icon: Building2, end: true, permission: 'empresa.view' },
      { to: '/admin/sucursales', label: 'Sucursales', icon: Store, end: true, permission: 'sucursales.view' },
      { to: '/admin/productos', label: 'Productos', icon: Package, end: true, permission: 'productos.view' },
      { to: '/admin/categorias', label: 'Categorías', icon: Tag, end: true, permission: 'categorias.view' },
      { to: '/admin/marcas', label: 'Marcas', icon: FolderBookmark, end: true, permission: 'marcas.view' },
    ],
  },
  {
    label: 'Aplicaciones',
    items: [
      { to: '/admin/servicios', label: 'Servicios', icon: Wrench, end: true, permission: 'servicios.view' },
      { to: '/admin/industrias', label: 'Industrias', icon: Factory, end: true, permission: 'industrias.view' },
    ],
  },
  {
    label: 'Contenido Web',
    items: [
      { to: '/admin/menus', label: 'Menús', icon: List, end: true, permission: 'menus.view' },
      { to: '/admin/footers', label: 'Footers', icon: LayoutDashboard, end: true, permission: 'footers.view' },
      { to: '/admin/secciones', label: 'Secciones', icon: LayoutGrid, end: true, permission: 'contenido.view' },
      { to: '/admin/tipos-seccion', label: 'Tipos Sección', icon: BookType, end: true, permission: 'tipo_seccion.view' },
      { to: '/admin/registros', label: 'Registros', icon: Type, end: true, permission: 'registros.view' },
      { to: '/admin/pasos-wizard', label: 'Pasos Wizard', icon: Wand2, end: true, permission: 'wizard.view' },
    ],
  },
  {
    label: 'Atributos',
    items: [
      { to: '/admin/tipos-atributo', label: 'Tipos Atributo', icon: TagIcon, end: true, permission: 'tipos_atributo.view' },
      { to: '/admin/atributos', label: 'Atributos', icon: Tags, end: true, permission: 'atributos.view' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users, end: true, permission: 'usuarios.view' },
      { to: '/admin/roles', label: 'Roles', icon: Shield, end: true, permission: 'roles.view' },
      { to: '/admin/contactos', label: 'Contactos', icon: Mail, end: true, permission: 'contactos.view' },
      { to: '/admin/suscriptores', label: 'Suscriptores', icon: Inbox, end: true, permission: 'suscriptores.view' },
      { to: '/admin/auditoria', label: 'Auditoría', icon: FileText, end: true, permission: 'auditoria.view' },
      { to: '/admin/configuracion', label: 'Configuración', icon: Settings, end: true, permission: 'configuracion.view' },
    ],
  },
]

// ============================================================================
// COMPONENTE
// ============================================================================
export const AdminSidebar = () => {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const { hasPermission } = usePermissions()

  // Filtrar grupos e items según permisos
  const filteredGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true
        return hasPermission(item.permission)
      }),
    }))
    .filter((group) => group.items.length > 0)

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel)
      } else {
        newSet.add(groupLabel)
      }
      return newSet
    })
  }

  const isGroupExpanded = (groupLabel: string) => {
    return expandedGroups.has(groupLabel)
  }

  // Auto-expandir el grupo que contiene la ruta actual
  useState(() => {
    filteredGroups.forEach((group) => {
      const hasActiveItem = group.items.some((item) => {
        const isActive = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)
        return isActive
      })
      if (hasActiveItem) {
        setExpandedGroups((prev) => new Set(prev).add(group.label))
      }
    })
  })

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
        <ul className="space-y-2">
          {filteredGroups.map((group) => {
            const isExpanded = isGroupExpanded(group.label)
            const hasActiveItem = group.items.some((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return isActive
            })

            return (
              <li key={group.label}>
                {/* Botón del grupo */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    hasActiveItem
                      ? 'bg-[#EA0A2A]/10 text-[#EA0A2A] dark:bg-[#EA0A2A]/20'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                        isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                      }`}
                    >
                      {group.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Items del grupo (expandibles) */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-1 pl-4">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = item.end
                        ? location.pathname === item.to
                        : location.pathname.startsWith(item.to)

                      return (
                        <li key={item.to} className="relative group">
                          <NavLink
                            to={item.to}
                            end={item.end}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-[#EA0A2A] text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
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
                </div>
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