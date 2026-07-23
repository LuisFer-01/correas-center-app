import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

// Mapeo de rutas a nombres legibles
const routeLabels: Record<string, string> = {
  'admin': 'Admin',
  'usuarios': 'Usuarios',
  'productos': 'Productos',
  'categorias': 'Categorías',
  'marcas': 'Marcas',
  'servicios': 'Servicios',
  'industrias': 'Industrias',
  'sucursales': 'Sucursales',
  'contactos': 'Contactos',
  'suscriptores': 'Suscriptores',
  'auditoria': 'Auditoría',
  'roles': 'Roles',
  'permisos': 'Permisos',
  'menus': 'Menús',
  'footers': 'Footers',
  'registros': 'Registros',
  'secciones': 'Secciones',
  'tipos-seccion': 'Tipos de Sección',
  'atributos': 'Atributos',
  'tipos-atributo': 'Tipos de Atributo',
  'pasos-wizard': 'Pasos Wizard',
  'empresas': 'Empresas',
  'nuevo': 'Nuevo',
  'editar': 'Editar',
  'configuracion': 'Configuración',
}

export const AdminBreadcrumbs = () => {
  const location = useLocation()
  
  // No mostrar en el Dashboard
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return null
  }

  const pathSegments = location.pathname
    .split('/')
    .filter(segment => segment !== '')
    .filter(segment => segment !== 'admin')

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin' }
  ]

  let currentPath = '/admin'
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label = routeLabels[segment] || segment
    
    if (index === pathSegments.length - 1) {
      breadcrumbs.push({ label })
    } else {
      breadcrumbs.push({ label, href: currentPath })
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <li key={index} className="flex items-center gap-2">
              {index === 0 && (
                <Home size={14} className="text-gray-500" />
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium dark:text-white">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href || '/admin'}
                  className="text-gray-500 hover:text-[#EA0A2A] transition-colors dark:text-gray-400 dark:hover:text-[#EA0A2A]"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}