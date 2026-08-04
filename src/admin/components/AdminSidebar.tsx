import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface SidebarItem {
  to: string
  label: string
  icon: any
  permission: string
  end?: boolean
}

interface SidebarGroup {
  label: string
  icon: any
  items: SidebarItem[]
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Catálogo',
    icon: Package,
    items: [
      { to: '/admin/empresas', label: 'Empresas', icon: Building2, permission: 'empresa.view', end: true },
      { to: '/admin/sucursales', label: 'Sucursales', icon: Store, permission: 'sucursales.view', end: true },
      { to: '/admin/marcas', label: 'Marcas', icon: FolderBookmark, permission: 'marcas.view', end: true },
      { to: '/admin/productos', label: 'Productos', icon: Package, permission: 'productos.view', end: true },
      { to: '/admin/categorias', label: 'Categorías', icon: Tag, permission: 'categorias.view', end: true },
    ],
  },
  {
    label: 'Aplicaciones',
    icon: Factory,
    items: [
      { to: '/admin/servicios', label: 'Servicios', icon: Wrench, permission: 'servicios.view', end: true },
      { to: '/admin/industrias', label: 'Industrias', icon: Factory, permission: 'industrias.view', end: true },
    ],
  },
  {
    label: 'Contenido Web',
    icon: LayoutDashboard,
    items: [
      { to: '/admin/menus', label: 'Menús', icon: List, permission: 'menus.view', end: true },
      { to: '/admin/footers', label: 'Footers', icon: LayoutDashboard, permission: 'footers.view', end: true },
      { to: '/admin/secciones', label: 'Secciones', icon: LayoutGrid, permission: 'contenido.view', end: true },
      { to: '/admin/registros', label: 'Registros', icon: Type, permission: 'registros.view', end: true },
      { to: '/admin/pasos-wizard', label: 'Pasos Wizard', icon: Wand2, permission: 'wizard.view', end: true },
      { to: '/admin/tipos-seccion', label: 'Tipos Sección', icon: BookType, permission: 'tipo_seccion.view', end: true },
    ],
  },
  {
    label: 'Atributos',
    icon: Tags,
    items: [
      { to: '/admin/tipos-atributo', label: 'Tipos Atributo', icon: TagIcon, permission: 'tipos_atributo.view', end: true },
      { to: '/admin/atributos', label: 'Atributos', icon: Tags, permission: 'atributos.view', end: true },
    ],
  },
  {
    label: 'Gestión',
    icon: Users,
    items: [
      { to: '/admin/roles', label: 'Roles', icon: Shield, permission: 'roles.manage', end: true },
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users, permission: 'usuarios.view', end: true },
      { to: '/admin/contactos', label: 'Contactos', icon: Mail, permission: 'contactos.view', end: true },
      { to: '/admin/suscriptores', label: 'Suscriptores', icon: Inbox, permission: 'suscriptores.view', end: true },
      { to: '/admin/auditoria', label: 'Auditoría', icon: FileText, permission: 'auditoria.view', end: true },
    ],
  },
  {
    label: 'Configuración',
    icon: Settings,
    items: [
      { to: '/admin/configuracion', label: 'Configuración', icon: Settings, permission: 'configuracion.view', end: true },
    ],
  },
]

export const AdminSidebar = () => {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const { hasPermission } = usePermissions()

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }))
  }

  // Filtrar items según permisos
  const getFilteredGroups = () => {
    return sidebarGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPermission(item.permission)),
      }))
      .filter((group) => group.items.length > 0)
  }

  const filteredGroups = getFilteredGroups()

  const isActive = (to: string, end?: boolean) => {
    if (end) {
      return location.pathname === to
    }
    return location.pathname.startsWith(to)
  }

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
          {/* Dashboard (siempre visible) */}
          <li className="relative group">
            <NavLink
              to="/admin"
              end
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive('/admin', true)
                  ? 'bg-[#EA0A2A] text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                Dashboard
              </span>
            </NavLink>
            {!isExpanded && (
              <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                Dashboard
              </div>
            )}
          </li>

          {/* Grupos de navegación */}
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupOpen = openGroups[group.label] || false

            return (
              <li key={group.label}>
                <Collapsible open={isGroupOpen} onOpenChange={() => toggleGroup(group.label)}>
                  <CollapsibleTrigger asChild>
                    <div
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        isExpanded
                          ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <GroupIcon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 flex-1 text-left ${
                          isExpanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                        }`}
                      >
                        {group.label}
                      </span>
                      {isExpanded && (
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                            isGroupOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const itemActive = isActive(item.to, item.end)

                        return (
                          <li key={item.to} className="relative group">
                            <NavLink
                              to={item.to}
                              end={item.end}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                itemActive
                                  ? 'bg-[#EA0A2A]/10 text-[#EA0A2A] dark:bg-[#EA0A2A]/20 dark:text-[#EA0A2A]'
                                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              <ItemIcon className="h-4 w-4 flex-shrink-0" />
                              <span
                                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                                  isExpanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'
                                }`}
                              >
                                {item.label}
                              </span>
                            </NavLink>
                            {!isExpanded && (
                              <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                                {item.label}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
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
            v1.0.7
          </p>
        </div>
      </div>
    </aside>
  )
}