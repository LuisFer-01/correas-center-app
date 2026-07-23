import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/AuthProvider'
import { AlertCircle, FileText, Mail, Package, Users, Wrench, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Stats {
  usuarios: number
  productos: number
  categorias: number
  servicios: number
  contactos: number
  suscriptores: number
}

export const Dashboard = () => {
  const { user } = useAuthContext()
  const [stats, setStats] = useState<Stats>({
    usuarios: 0,
    productos: 0,
    categorias: 0,
    servicios: 0,
    contactos: 0,
    suscriptores: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Obtener conteos reales de la base de datos
        const [
          usuariosResult,
          productosResult,
          categoriasResult,
          serviciosResult,
          contactosResult,
          suscriptoresResult,
        ] = await Promise.all([
          supabase.from('perfiles').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
          supabase.from('productos').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
          supabase.from('categorias').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
          supabase.from('servicios').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
          supabase.from('contactos').select('id', { count: 'exact', head: true }).eq('estado', 'nuevo'),
          supabase.from('suscriptores').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
        ])

        setStats({
          usuarios: usuariosResult.count || 0,
          productos: productosResult.count || 0,
          categorias: categoriasResult.count || 0,
          servicios: serviciosResult.count || 0,
          contactos: contactosResult.count || 0,
          suscriptores: suscriptoresResult.count || 0,
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statsCards = [
    {
      title: 'Usuarios Activos',
      value: stats.usuarios,
      icon: Users,
      description: 'Usuarios registrados en el sistema',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      link: '/admin/usuarios',
    },
    {
      title: 'Productos',
      value: stats.productos,
      icon: Package,
      description: 'Productos en el catálogo',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      link: '/admin/productos',
    },
    {
      title: 'Categorías',
      value: stats.categorias,
      icon: FileText,
      description: 'Categorías de productos',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      link: '/admin/categorias',
    },
    {
      title: 'Servicios',
      value: stats.servicios,
      icon: Wrench,
      description: 'Servicios disponibles',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
      link: '/admin/servicios',
    },
    {
      title: 'Contactos Nuevos',
      value: stats.contactos,
      icon: Mail,
      description: 'Mensajes sin responder',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/30',
      link: '/admin/contactos',
    },
    {
      title: 'Suscriptores',
      value: stats.suscriptores,
      icon: Zap,
      description: 'Suscriptores al newsletter',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      link: '/admin/suscriptores',
    },
  ]

  const quickAccess = [
    { title: 'Gestionar Usuarios', href: '/admin/usuarios', icon: Users },
    { title: 'Ver Productos', href: '/admin/productos', icon: Package },
    { title: 'Contactos', href: '/admin/contactos', icon: Mail },
    { title: 'Auditoría', href: '/admin/auditoria', icon: AlertCircle },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#EA0A2A] border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Cargando estadísticas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          ¡Bienvenido al Panel de Administración!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Resumen general del sistema Correas Center
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white dark:bg-white/10 rounded-xl border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-shadow hover:border-[#EA0A2A]/30"
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {stat.title}
                </h3>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                {stat.description}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white dark:bg-gradient-to-r dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Accesos Rápidos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Módulos más utilizados del sistema
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickAccess.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className="bg-gray-50 dark:bg-white/10 flex flex-col items-start gap-3 p-4 border border-gray-200 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/20 hover:border-[#EA0A2A]/30 transition-colors"
              >
                <div className="bg-white dark:bg-white/20 p-2 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-700 dark:text-white" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}