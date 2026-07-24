import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarMarca,
    getMarcas,
    restaurarMarca,
} from '@/admin/services/marca.service'
import type { Marca } from '@/admin/types/marca'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MarcaForm } from './components/MarcaForm'

export const MarcasIndex = () => {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [marcaEditar, setMarcaEditar] = useState<Marca | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [marcaEliminar, setMarcaEliminar] = useState<Marca | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadMarcas = async () => {
    setIsLoading(true)
    try {
      const data = await getMarcas(true) // Incluir eliminados
      setMarcas(data)
    } catch (error) {
      console.error('Error al cargar marcas:', error)
      toast.error('Error al cargar', 'No se pudieron obtener las marcas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMarcas()
  }, [])

  const handleNuevaMarca = () => {
    setMarcaEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarMarca = (marca: Marca) => {
    setMarcaEditar(marca)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (marca: Marca) => {
    setMarcaEliminar(marca)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!marcaEliminar) return
    setIsDeleting(true)
    try {
      await eliminarMarca(marcaEliminar.id)
      toast.success('Marca eliminada', 'La marca se marcó como eliminada')
      setIsDeleteOpen(false)
      setMarcaEliminar(null)
      await loadMarcas()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (marca: Marca) => {
    try {
      await restaurarMarca(marca.id)
      toast.success('Marca restaurada', 'La marca volvió a estado activo')
      await loadMarcas()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setMarcaEditar(null)
    loadMarcas()
  }

  // Filtrar marcas según si mostrar eliminadas
  const filteredMarcas = marcas.filter((m) => {
    if (m.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Marca>[] = [
    {
      accessorKey: 'logo',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage
            src={row.original.logo}
            alt={row.original.nombre}
            className="object-contain p-1"
          />
          <AvatarFallback className="bg-[#EA0A2A] text-white rounded-lg">
            <Tag className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Marca',
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
        const marca = row.original

        if (marca.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(marca)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditarMarca(marca)}
              title="Editar"
              className="dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => handleEliminarClick(marca)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marcas"
        description="Gestiona las marcas asociadas a los productos"
        actions={
          <>
            <Button
              variant={showDeleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDeleted(!showDeleted)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDeleted ? 'Ocultar Eliminadas' : 'Ver Eliminadas'}
            </Button>
            <Button
              onClick={handleNuevaMarca}
              className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Marca
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredMarcas}
        searchKey="nombre"
        searchPlaceholder="Buscar marcas..."
        isLoading={isLoading}
      />

      <MarcaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        marcaEditar={marcaEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar esta marca?"
        description={`Se marcará como eliminada la marca "${marcaEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}