import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarServicio,
    getServicios,
    restaurarServicio,
} from '@/admin/services/servicio.service'
import type { Servicio } from '@/admin/types/servicio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ServicioForm } from './components/ServicioForm'

export const ServiciosIndex = () => {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [servicioEditar, setServicioEditar] = useState<Servicio | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [servicioEliminar, setServicioEliminar] = useState<Servicio | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadServicios = async () => {
    setIsLoading(true)
    try {
      const data = await getServicios(true) // Incluir eliminados
      setServicios(data)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los servicios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServicios()
  }, [])

  const handleNuevoServicio = () => {
    setServicioEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarServicio = (servicio: Servicio) => {
    setServicioEditar(servicio)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (servicio: Servicio) => {
    setServicioEliminar(servicio)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!servicioEliminar) return
    setIsDeleting(true)
    try {
      await eliminarServicio(servicioEliminar.id)
      toast.success('Servicio eliminado', 'El servicio se marcó como eliminado')
      setIsDeleteOpen(false)
      setServicioEliminar(null)
      await loadServicios()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (servicio: Servicio) => {
    try {
      await restaurarServicio(servicio.id)
      toast.success('Servicio restaurado', 'El servicio volvió a estado activo')
      await loadServicios()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setServicioEditar(null)
    loadServicios()
  }

  // Filtrar servicios según si mostrar eliminados
  const filteredServicios = servicios.filter((s) => {
    if (s.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Servicio>[] = [
    {
      accessorKey: 'imagen',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage
            src={row.original.imagen}
            alt={row.original.nombre}
            className="object-contain p-1"
          />
          <AvatarFallback className="bg-[#EA0A2A] text-white rounded-lg">
            <Wrench className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Servicio',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.getValue('nombre')}
        </div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {row.getValue('descripcion') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.original.empresa?.nombre || '—'}
        </div>
      ),
    },
    {
      id: 'industrias',
      header: 'Industrias',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.original.industrias_asignadas && row.original.industrias_asignadas.length > 0 ? (
            row.original.industrias_asignadas.map((asig) => (
              <Badge key={asig.id} variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                {asig.industria?.nombre}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Sin asignar</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'orden',
      header: 'Orden',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.getValue('orden')}
        </Badge>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('estado')} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const servicio = row.original

        if (servicio.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(servicio)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="servicios.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarServicio(servicio)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="servicios.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(servicio)}
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
        title="Servicios"
        description="Gestiona los servicios ofrecidos por la empresa"
        actions={
          <>
            <RequirePermission permission="servicios.view_deleted">
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
            <RequirePermission permission="servicios.create">
              <Button
                onClick={handleNuevoServicio}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredServicios}
        searchKey="nombre"
        searchPlaceholder="Buscar servicios..."
        isLoading={isLoading}
      />

      <ServicioForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        servicioEditar={servicioEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este servicio?"
        description={`Se marcará como eliminado el servicio "${servicioEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}