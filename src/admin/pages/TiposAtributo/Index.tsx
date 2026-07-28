import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarTipoAtributo,
    getTiposAtributo,
    restaurarTipoAtributo,
} from '@/admin/services/tipo-atributo.service'
import type { TipoAtributo } from '@/admin/types/tipo-atributo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TipoAtributoForm } from './components/TipoAtributoForm'

export const TiposAtributoIndex = () => {
  const [tipos, setTipos] = useState<TipoAtributo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [tipoEditar, setTipoEditar] = useState<TipoAtributo | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [tipoEliminar, setTipoEliminar] = useState<TipoAtributo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadTipos = async () => {
    setIsLoading(true)
    try {
      const data = await getTiposAtributo(true)
      setTipos(data)
    } catch (error) {
      console.error('Error al cargar tipos de atributo:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los tipos de atributo')
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

  const handleEditarTipo = (tipo: TipoAtributo) => {
    setTipoEditar(tipo)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (tipo: TipoAtributo) => {
    setTipoEliminar(tipo)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!tipoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarTipoAtributo(tipoEliminar.id)
      toast.success('Tipo eliminado', 'El tipo de atributo se marcó como eliminado')
      setIsDeleteOpen(false)
      setTipoEliminar(null)
      await loadTipos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (tipo: TipoAtributo) => {
    try {
      await restaurarTipoAtributo(tipo.id)
      toast.success('Tipo restaurado', 'El tipo de atributo volvió a estado activo')
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

  const columns: ColumnDef<TipoAtributo>[] = [
    {
      accessorKey: 'nombre',
      header: 'Tipo de Atributo',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
      id: 'opciones',
      header: 'Opciones',
      cell: ({ row }) => {
        const tipo = row.original
        return (
          <div className="flex flex-wrap gap-1">
            {tipo.permite_descripcion && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                Descripción
              </Badge>
            )}
            {tipo.permite_valor_numerico && (
              <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                Numérico
              </Badge>
            )}
            {tipo.permite_unidad_medida && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                Unidad
              </Badge>
            )}
            {!tipo.permite_descripcion && !tipo.permite_valor_numerico && !tipo.permite_unidad_medida && (
              <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
            )}
          </div>
        )
      },
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
            <RequirePermission permission="tipos_atributo.update">
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
            <RequirePermission permission="tipos_atributo.delete">
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
        title="Tipos de Atributo"
        description="Gestiona los tipos de atributos técnicos para productos"
        actions={
          <>
            <RequirePermission permission="tipos_atributo.view_deleted">
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
            <RequirePermission permission="tipos_atributo.create">
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
        searchPlaceholder="Buscar tipos de atributo..."
        isLoading={isLoading}
      />

      <TipoAtributoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tipoEditar={tipoEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este tipo de atributo?"
        description={`Se marcará como eliminado el tipo "${tipoEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}