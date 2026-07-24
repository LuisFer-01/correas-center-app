import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarIndustria,
    getIndustrias,
    restaurarIndustria,
} from '@/admin/services/industria.service'
import type { Industria } from '@/admin/types/industria'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Factory, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IndustriaForm } from './components/IndustriaForm'

export const IndustriasIndex = () => {
  const [industrias, setIndustrias] = useState<Industria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [industriaEditar, setIndustriaEditar] = useState<Industria | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [industriaEliminar, setIndustriaEliminar] = useState<Industria | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadIndustrias = async () => {
    setIsLoading(true)
    try {
      const data = await getIndustrias(true) // Incluir eliminados
      setIndustrias(data)
    } catch (error) {
      console.error('Error al cargar industrias:', error)
      toast.error('Error al cargar', 'No se pudieron obtener las industrias')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIndustrias()
  }, [])

  const handleNuevaIndustria = () => {
    setIndustriaEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarIndustria = (industria: Industria) => {
    setIndustriaEditar(industria)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (industria: Industria) => {
    setIndustriaEliminar(industria)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!industriaEliminar) return
    setIsDeleting(true)
    try {
      await eliminarIndustria(industriaEliminar.id)
      toast.success('Industria eliminada', 'La industria se marcó como eliminada')
      setIsDeleteOpen(false)
      setIndustriaEliminar(null)
      await loadIndustrias()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (industria: Industria) => {
    try {
      await restaurarIndustria(industria.id)
      toast.success('Industria restaurada', 'La industria volvió a estado activo')
      await loadIndustrias()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setIndustriaEditar(null)
    loadIndustrias()
  }

  // Filtrar industrias según si mostrar eliminadas
  const filteredIndustrias = industrias.filter((i) => {
    if (i.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Industria>[] = [
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
            <Factory className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Industria/Aplicación',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.getValue('nombre')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {row.original.slug}
          </div>
        </div>
      ),
    },
    {
      id: 'asignaciones',
      header: 'Asignaciones',
      cell: ({ row }) => {
        const asignaciones = row.original.asignaciones || []
        const categorias = asignaciones.filter(a => a.tipo_registro === 'categoria')
        const servicios = asignaciones.filter(a => a.tipo_registro === 'servicio')
        
        return (
          <div className="flex flex-col gap-1">
            {categorias.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categorias.map((asig) => (
                  <Badge key={asig.id} variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                    {asig.categoria?.nombre}
                  </Badge>
                ))}
              </div>
            )}
            {servicios.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {servicios.map((asig) => (
                  <Badge key={asig.id} variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                    {asig.servicio?.nombre}
                  </Badge>
                ))}
              </div>
            )}
            {asignaciones.length === 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">Sin asignar</span>
            )}
          </div>
        )
      },
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
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('estado')} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const industria = row.original

        if (industria.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(industria)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="industrias.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarIndustria(industria)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="industrias.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(industria)}
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
        title="Industrias / Aplicaciones"
        description="Gestiona las industrias y campos de aplicación de los productos"
        actions={
          <>
            <RequirePermission permission="industrias.view_deleted">
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
            <RequirePermission permission="industrias.create">
              <Button
                onClick={handleNuevaIndustria}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Industria
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredIndustrias}
        searchKey="nombre"
        searchPlaceholder="Buscar industrias..."
        isLoading={isLoading}
      />

      <IndustriaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        industriaEditar={industriaEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar esta industria?"
        description={`Se marcará como eliminada la industria "${industriaEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}