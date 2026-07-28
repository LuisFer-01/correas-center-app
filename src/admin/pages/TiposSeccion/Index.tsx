import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarTipoSeccion,
    getTiposSeccion,
    restaurarTipoSeccion,
} from '@/admin/services/tipo-seccion.service'
import type { TipoSeccion } from '@/admin/types/tipo-seccion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TipoSeccionForm } from './components/TipoSeccionForm'

export const TiposSeccionIndex = () => {
  const [tipos, setTipos] = useState<TipoSeccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [tipoEditar, setTipoEditar] = useState<TipoSeccion | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [tipoEliminar, setTipoEliminar] = useState<TipoSeccion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadTipos = async () => {
    setIsLoading(true)
    try {
      const data = await getTiposSeccion(true)
      setTipos(data)
    } catch (error) {
      console.error('Error al cargar tipos de sección:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los tipos de sección')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTipos()
  }, [])

  const handleNuevoTipo = () => {
    setTipoEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarTipo = (tipo: TipoSeccion) => {
    setTipoEditar(tipo)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (tipo: TipoSeccion) => {
    setTipoEliminar(tipo)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!tipoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarTipoSeccion(tipoEliminar.id)
      toast.success('Tipo eliminado', 'El tipo de sección se marcó como eliminado')
      setIsDeleteOpen(false)
      setTipoEliminar(null)
      await loadTipos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (tipo: TipoSeccion) => {
    try {
      await restaurarTipoSeccion(tipo.id)
      toast.success('Tipo restaurado', 'El tipo de sección volvió a estado activo')
      await loadTipos()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setTipoEditar(null)
    loadTipos()
  }

  const filteredTipos = tipos.filter((t) => {
    if (t.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<TipoSeccion>[] = [
    {
      accessorKey: 'nombre',
      header: 'Tipo de Sección',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Type className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.getValue('nombre')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {row.original.slug}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
          {row.getValue('descripcion') || '—'}
        </div>
      ),
    },
    {
      id: 'campos_metadata',
      header: 'Campos Dinámicos',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.original.campos_metadata && row.original.campos_metadata.length > 0 ? (
            row.original.campos_metadata.slice(0, 3).map((campo) => (
              <Badge key={campo} variant="outline" className="font-mono text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                {campo}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Sin campos</span>
          )}
          {row.original.campos_metadata && row.original.campos_metadata.length > 3 && (
            <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              +{row.original.campos_metadata.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'icono',
      header: 'Icono',
      cell: ({ row }) => (
        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {row.getValue('icono') || '—'}
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
        const tipo = row.original

        if (tipo.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(tipo)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="tipo_seccion.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarTipo(tipo)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="tipo_seccion.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(tipo)}
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
        title="Tipos de Sección"
        description="Define los tipos de secciones del sitio (Hero, Diferencial, etc.)"
        actions={
          <>
            <RequirePermission permission="tipo_seccion.view_deleted">
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
            <RequirePermission permission="tipo_seccion.create">
              <Button
                onClick={handleNuevoTipo}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Tipo
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredTipos}
        searchKey="nombre"
        searchPlaceholder="Buscar tipos de sección..."
        isLoading={isLoading}
      />

      <TipoSeccionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tipoEditar={tipoEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este tipo de sección?"
        description={`Se marcará como eliminado el tipo "${tipoEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}