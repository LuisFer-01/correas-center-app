import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { toast } from '@/admin/components/shared/Toast'
import {
    activarSuscriptor,
    desactivarSuscriptor,
    eliminarSuscriptor,
    exportarSuscriptoresCSV,
    exportarSuscriptoresExcel,
    getSuscriptores,
    getSuscriptoresStats,
    restaurarSuscriptor,
    verificarEmail,
} from '@/admin/services/suscriptor.service'
import type { EstadoSuscriptor, Suscriptor, SuscriptorStats } from '@/admin/types/suscriptor'
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
    Download,
    Eye,
    FileSpreadsheet,
    Mail,
    RotateCcw,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export const SuscriptoresIndex = () => {
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([])
  const [stats, setStats] = useState<SuscriptorStats>({
    activos: 0,
    inactivos: 0,
    verificados: 0,
    noVerificados: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [showDeleted, setShowDeleted] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [suscriptorEliminar, setSuscriptorEliminar] = useState<Suscriptor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [suscriptoresData, statsData] = await Promise.all([
        getSuscriptores(true),
        getSuscriptoresStats(),
      ])
      setSuscriptores(suscriptoresData)
      setStats(statsData)
    } catch (error) {
      console.error('Error al cargar suscriptores:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los suscriptores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleActivar = async (id: number) => {
    try {
      await activarSuscriptor(id)
      toast.success('Suscriptor activado', 'El suscriptor fue activado correctamente')
      await loadData()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo activar el suscriptor')
    }
  }

  const handleDesactivar = async (id: number) => {
    try {
      await desactivarSuscriptor(id)
      toast.success('Suscriptor desactivado', 'El suscriptor fue desactivado correctamente')
      await loadData()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo desactivar el suscriptor')
    }
  }

  const handleVerificarEmail = async (id: number) => {
    try {
      await verificarEmail(id)
      toast.success('Email verificado', 'El email del suscriptor fue marcado como verificado')
      await loadData()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo verificar el email')
    }
  }

  const handleEliminarClick = (suscriptor: Suscriptor) => {
    setSuscriptorEliminar(suscriptor)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!suscriptorEliminar) return
    setIsDeleting(true)
    try {
      await eliminarSuscriptor(suscriptorEliminar.id)
      toast.success('Suscriptor eliminado', 'El suscriptor se marcó como eliminado')
      setIsDeleteOpen(false)
      setSuscriptorEliminar(null)
      await loadData()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (id: number) => {
    try {
      await restaurarSuscriptor(id)
      toast.success('Suscriptor restaurado', 'El suscriptor volvió a estado activo')
      await loadData()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleExportarCSV = async () => {
    try {
      const estado = filtroEstado === 'todos' ? undefined : (filtroEstado as EstadoSuscriptor)
      const blob = await exportarSuscriptoresCSV(estado)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Exportación exitosa', 'El archivo CSV se descargó correctamente')
    } catch (error: any) {
      toast.error('Error al exportar', error.message || 'Ocurrió un error al generar el CSV')
    }
  }

  const handleExportarExcel = async () => {
    try {
        const estado = filtroEstado === 'todos' ? undefined : (filtroEstado as EstadoSuscriptor)
        const blob = await exportarSuscriptoresExcel(estado)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Exportación exitosa', 'El archivo Excel se descargó correctamente')
    } catch (error: any) {
        toast.error('Error al exportar', error.message || 'Ocurrió un error al generar el Excel')
    }
    }

  const getEstadoColor = (estado: EstadoSuscriptor) => {
    const colors = {
      activo: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      inactivo: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      eliminado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    }
    return colors[estado] || colors.activo
  }

  const getEstadoLabel = (estado: EstadoSuscriptor) => {
    const labels = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      eliminado: 'Eliminado',
    }
    return labels[estado] || estado
  }

  // Filtrar suscriptores según estado y showDeleted
  const filteredSuscriptores = suscriptores.filter((s) => {
    if (s.eliminado_en) {
      return showDeleted
    }
    if (filtroEstado !== 'todos' && s.estado !== filtroEstado) {
      return false
    }
    return true
  })

  const columns: ColumnDef<Suscriptor>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.getValue('email')}
          </div>
          {row.original.nombre && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {row.original.nombre}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.original.empresa?.nombre || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getEstadoColor(row.getValue('estado') as EstadoSuscriptor)}
        >
          {getEstadoLabel(row.getValue('estado') as EstadoSuscriptor)}
        </Badge>
      ),
    },
    {
      id: 'email_verificado',
      header: 'Email Verificado',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.email_verificado_en ? (
            <>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                {new Date(row.original.email_verificado_en).toLocaleDateString('es-BO')}
              </span>
            </>
          ) : (
            <>
              <UserX className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">No verificado</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'creado_en',
      header: 'Fecha Registro',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.getValue('creado_en')).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const suscriptor = row.original
        
        if (suscriptor.eliminado_en) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(suscriptor.id)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restaurar
            </Button>
          )
        }
        
        return (
          <div className="flex items-center gap-1">
            {suscriptor.estado === 'activo' ? (
              <RequirePermission permission="suscriptores.manage">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDesactivar(suscriptor.id)}
                  title="Desactivar"
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </RequirePermission>
            ) : (
              <RequirePermission permission="suscriptores.manage">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleActivar(suscriptor.id)}
                  title="Activar"
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </RequirePermission>
            )}
            {!suscriptor.email_verificado_en && (
              <RequirePermission permission="suscriptores.manage">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVerificarEmail(suscriptor.id)}
                  title="Verificar Email"
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </RequirePermission>
            )}
            <RequirePermission permission="suscriptores.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(suscriptor)}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </RequirePermission>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suscriptores"
        description="Gestiona la lista de suscriptores al newsletter"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportarCSV}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportarExcel}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Activos</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activos}</p>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Inactivos</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inactivos}</p>
            </div>
            <UserX className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Emails Verificados</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.verificados}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[200px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
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
        <div className="flex gap-2">
          <RequirePermission permission="suscriptores.view_deleted">
            <Button
              variant={showDeleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDeleted(!showDeleted)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDeleted ? 'Ocultar Eliminados' : 'Ver Eliminados'}
            </Button>
          </RequirePermission>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSuscriptores}
        searchKey="email"
        searchPlaceholder="Buscar por email o nombre..."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este suscriptor?"
        description={`Se marcará como eliminado al suscriptor "${suscriptorEliminar?.email}". Esta acción se puede revertir.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}