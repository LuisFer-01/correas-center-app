import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { toast } from '@/admin/components/shared/Toast'
import {
  archivarContacto,
  desarchivarContacto, // ✅ NUEVO
  getContactos,
  getContactosStats,
  marcarComoLeido,
  marcarComoRespondido,
} from '@/admin/services/contacto.service'
import type { Contacto, EstadoContacto } from '@/admin/types/contacto'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Archive,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ContactoDetailModal } from './components/ContactoDetalleModal'

export const ContactosIndex = () => {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [stats, setStats] = useState({
    nuevos: 0,
    leidos: 0,
    respondidos: 0,
    archivados: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [showDeleted, setShowDeleted] = useState(false)
  
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [contactoSeleccionado, setContactoSeleccionado] = useState<Contacto | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [contactosData, statsData] = await Promise.all([
        getContactos(false),
        getContactosStats(),
      ])
      setContactos(contactosData)
      setStats(statsData)
    } catch (error) {
      console.error('Error al cargar contactos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los contactos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMarcarLeido = async (id: number) => {
    try {
      await marcarComoLeido(id)
      toast.success('Contacto marcado', 'Se marcó como leído correctamente')
      await loadData()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo marcar como leído')
    }
  }

  const handleMarcarRespondido = async (id: number) => {
    try {
      await marcarComoRespondido(id)
      toast.success('Contacto marcado', 'Se marcó como respondido correctamente')
      await loadData()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo marcar como respondido')
    }
  }

  const handleArchivar = async (id: number) => {
    try {
      await archivarContacto(id)
      toast.success('Contacto archivado', 'El contacto se archivó correctamente')
      await loadData()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo archivar el contacto')
    }
  }

  // ✅ NUEVO: Handler para desarchivar
  const handleDesarchivar = async (id: number) => {
    try {
      await desarchivarContacto(id)
      toast.success('Contacto desarchivado', 'El contacto volvió a estado nuevo')
      await loadData()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo desarchivar el contacto')
    }
  }

  const handleVerDetalle = (contacto: Contacto) => {
    setContactoSeleccionado(contacto)
    setIsDetailOpen(true)
  }

  const getEstadoColor = (estado: EstadoContacto) => {
    const colors = {
      nuevo: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      leido: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      respondido: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      archivado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    }
    return colors[estado] || colors.nuevo
  }

  const getEstadoLabel = (estado: EstadoContacto) => {
    const labels = {
      nuevo: 'Nuevo',
      leido: 'Leído',
      respondido: 'Respondido',
      archivado: 'Archivado',
    }
    return labels[estado] || estado
  }

  const filteredContactos = contactos.filter((c) => {
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) {
      return false
    }
    return true
  })

  const columns: ColumnDef<Contacto>[] = [
    {
      accessorKey: 'nombre',
      header: 'Contacto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.getValue('nombre')}
          </div>
          {row.original.empresa && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {row.original.empresa}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {row.getValue('email')}
        </div>
      ),
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          {row.getValue('telefono')}
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getEstadoColor(row.getValue('estado') as EstadoContacto)}
        >
          {getEstadoLabel(row.getValue('estado') as EstadoContacto)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleVerDetalle(row.original)}
          title="Ver detalle"
          className="dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandeja de Entrada"
        description="Gestiona los mensajes de contacto recibidos"
        actions={
          <>
            <Button
              variant={showDeleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDeleted(!showDeleted)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Archive className="h-4 w-4 mr-2" />
              {showDeleted ? 'Ocultar Archivados' : 'Ver Archivados'}
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Nuevos</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.nuevos}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Leídos</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.leidos}</p>
            </div>
            <Eye className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Respondidos</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.respondidos}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[200px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="nuevo">Nuevos</SelectItem>
              <SelectItem value="leido">Leídos</SelectItem>
              <SelectItem value="respondido">Respondidos</SelectItem>
              <SelectItem value="archivado">Archivados</SelectItem>
            </SelectContent>
          </Select>
          {filtroEstado !== 'todos' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltroEstado('todos')}
              className="text-gray-500 hover:text-[#EA0A2A] dark:text-gray-400 dark:hover:text-[#EA0A2A]"
            >
              Limpiar filtro
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredContactos}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre, email o teléfono..."
        isLoading={isLoading}
      />

      {/* Modal de Detalle */}
      <ContactoDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        contacto={contactoSeleccionado}
        onMarcarLeido={handleMarcarLeido}
        onMarcarRespondido={handleMarcarRespondido}
        onArchivar={handleArchivar}
        onDesarchivar={handleDesarchivar} // ✅ NUEVO
      />
    </div>
  )
}