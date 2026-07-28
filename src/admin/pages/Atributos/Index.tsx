import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarAtributo,
    getAtributos,
    restaurarAtributo,
} from '@/admin/services/atributo.service'
import type { AtributoTecnico } from '@/admin/types/atributo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Tag, Timeline, Trash2 } from 'lucide-react'; // ✅ Timeline agregado
import { useEffect, useState } from 'react'
import { AtributoForm } from './components/AtributoForm'
import { CategoriasModal } from './components/CategoriasModal'; // ✅ NUEVO

export const AtributosIndex = () => {
  const [atributos, setAtributos] = useState<AtributoTecnico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [atributoEditar, setAtributoEditar] = useState<AtributoTecnico | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [atributoEliminar, setAtributoEliminar] = useState<AtributoTecnico | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  
  // ✅ NUEVOS: Estados para el modal de categorías
  const [isCategoriasModalOpen, setIsCategoriasModalOpen] = useState(false)
  const [atributoParaCategorias, setAtributoParaCategorias] = useState<AtributoTecnico | null>(null)

  const loadAtributos = async () => {
    setIsLoading(true)
    try {
      const data = await getAtributos(true)
      setAtributos(data)
    } catch (error) {
      console.error('Error al cargar atributos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los atributos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAtributos()
  }, [])

  const handleNuevoAtributo = () => {
    setAtributoEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarAtributo = (atributo: AtributoTecnico) => {
    setAtributoEditar(atributo)
    setIsFormOpen(true)
  }

  // ✅ NUEVO: Abrir modal de categorías
  const handleOpenCategoriasModal = (atributo: AtributoTecnico) => {
    setAtributoParaCategorias(atributo)
    setIsCategoriasModalOpen(true)
  }

  const handleEliminarClick = (atributo: AtributoTecnico) => {
    setAtributoEliminar(atributo)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!atributoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarAtributo(atributoEliminar.id)
      toast.success('Atributo eliminado', 'El atributo se marcó como eliminado')
      setIsDeleteOpen(false)
      setAtributoEliminar(null)
      await loadAtributos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (atributo: AtributoTecnico) => {
    try {
      await restaurarAtributo(atributo.id)
      toast.success('Atributo restaurado', 'El atributo volvió a estado activo')
      await loadAtributos()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setAtributoEditar(null)
    loadAtributos()
  }

  const filteredAtributos = atributos.filter((a) => {
    if (a.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<AtributoTecnico>[] = [
    {
      accessorKey: 'nombre',
      header: 'Atributo',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.getValue('nombre')}
          </div>
          {row.original.tipo_atributo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tipo: {row.original.tipo_atributo.nombre}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tipo_atributo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.original.tipo_atributo?.nombre || '—'}
        </Badge>
      ),
    },
    // ✅ COLUMNA ACTUALIZADA: Muestra contador y botón de gestión
    {
      id: 'categorias',
      header: 'Categorías',
      cell: ({ row }) => {
        const atributo = row.original
        const count = atributo.categorias?.length || 0
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {count}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-[#EA0A2A] dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => handleOpenCategoriasModal(atributo)}
              title="Gestionar categorías"
            >
              <Timeline className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'valor_numerico',
      header: 'Valor',
      cell: ({ row }) => {
        const valor = row.getValue('valor_numerico') as number | null
        const unidad = row.original.unidad_medida
        if (!valor) return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
        return (
          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {valor} {unidad && <span className="text-gray-500 dark:text-gray-400">{unidad}</span>}
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
        const atributo = row.original

        if (atributo.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(atributo)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="atributos.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarAtributo(atributo)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="atributos.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(atributo)}
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
        title="Atributos Técnicos"
        description="Gestiona los atributos técnicos de productos (características, medidas, etc.)"
        actions={
          <>
            <RequirePermission permission="atributos.view_deleted">
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
            <RequirePermission permission="atributos.create">
              <Button
                onClick={handleNuevoAtributo}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Atributo
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredAtributos}
        searchKey="nombre"
        searchPlaceholder="Buscar atributos técnicos..."
        isLoading={isLoading}
      />

      <AtributoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        atributoEditar={atributoEditar}
        onSuccess={handleSuccess}
      />

      {/* ✅ NUEVO: Modal de gestión de categorías */}
      <CategoriasModal
        open={isCategoriasModalOpen}
        onOpenChange={setIsCategoriasModalOpen}
        atributo={atributoParaCategorias}
        onSuccess={loadAtributos}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este atributo?"
        description={`Se marcará como eliminado el atributo "${atributoEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}