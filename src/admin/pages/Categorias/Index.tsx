import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
  eliminarCategoria,
  getCategorias,
  getProductosActivos,
  restaurarCategoria,
} from '@/admin/services/categoria.service'
import type { Categoria } from '@/admin/types/categoria'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CategoriaForm } from './components/CategoriaForm'

export const CategoriasIndex = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [categoriaEliminar, setCategoriaEliminar] = useState<Categoria | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  
  // ✅ NUEVO: Estados para el filtro de productos
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>([])
  const [productoFiltro, setProductoFiltro] = useState<number | ''>('')

  const loadCategorias = async () => {
    setIsLoading(true)
    try {
      const data = await getCategorias(true) // Incluir eliminados
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast.error('Error al cargar', 'No se pudieron obtener las categorías')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ NUEVO: Cargar productos activos para el filtro
  const loadProductos = async () => {
    try {
      const data = await getProductosActivos()
      setProductos(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  useEffect(() => {
    loadCategorias()
    loadProductos()
  }, [])

  const handleNuevaCategoria = () => {
    setCategoriaEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditar(categoria)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (categoria: Categoria) => {
    setCategoriaEliminar(categoria)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!categoriaEliminar) return
    setIsDeleting(true)
    try {
      await eliminarCategoria(categoriaEliminar.id)
      toast.success('Categoría eliminada', 'La categoría se marcó como eliminada')
      setIsDeleteOpen(false)
      setCategoriaEliminar(null)
      await loadCategorias()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (categoria: Categoria) => {
    try {
      await restaurarCategoria(categoria.id)
      toast.success('Categoría restaurada', 'La categoría volvió a estado activo')
      await loadCategorias()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setCategoriaEditar(null)
    loadCategorias()
  }

  // Filtrar categorías según si mostrar eliminadas
  const filteredCategorias = categorias.filter((c) => {
    if (c.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  // ✅ NUEVO: Filtrar y ordenar categorías por producto
  const categoriasFiltradas = filteredCategorias
    .filter((c) => {
      if (!productoFiltro) return true
      return c.producto_id === Number(productoFiltro)
    })
    .sort((a, b) => {
      // ✅ Ordenar por producto primero
      if (a.producto?.nombre && b.producto?.nombre) {
        const comp = a.producto.nombre.localeCompare(b.producto.nombre)
        if (comp !== 0) return comp
      } else if (a.producto?.nombre) {
        return -1
      } else if (b.producto?.nombre) {
        return 1
      }
      // ✅ Luego ordenar por orden de categoría
      return (a.orden || 0) - (b.orden || 0)
    })

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: 'imagen',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage
            src={row.original.imagen ?? undefined}
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
      header: 'Categoría',
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
      accessorKey: 'producto',
      header: 'Producto',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.original.producto?.nombre || '—'}
        </Badge>
      ),
    },
    {
      accessorKey: 'uso',
      header: 'Uso',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {row.getValue('uso') || '—'}
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
        const categoria = row.original
        if (categoria.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(categoria)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="categorias.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarCategoria(categoria)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="categorias.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(categoria)}
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
        title="Categorías"
        description="Gestiona las categorías asociadas a cada producto"
        actions={
          <>
            <RequirePermission permission="categorias.view_deleted">
              <Button
                variant={showDeleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDeleted(!showDeleted)}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDeleted ? 'Ocultar Eliminadas' : 'Ver Eliminadas'}
              </Button>
            </RequirePermission>
            <RequirePermission permission="categorias.create">
              <Button
                onClick={handleNuevaCategoria}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </RequirePermission>
          </>
        }
      />

      {/* ✅ NUEVO: Filtro de productos */}
      {productos.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por producto:
          </label>
          <select
            value={productoFiltro}
            onChange={(e) => setProductoFiltro(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white border-0 focus:ring-2 focus:ring-[#EA0A2A] focus:outline-none cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <option value="">Todos los productos</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
          {productoFiltro && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProductoFiltro('')}
              className="text-gray-600 dark:text-gray-400 hover:text-[#EA0A2A]"
            >
              Limpiar filtro
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={categoriasFiltradas}
        searchKey="nombre"
        searchPlaceholder="Buscar categorías..."
        isLoading={isLoading}
      />
      <CategoriaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        categoriaEditar={categoriaEditar}
        onSuccess={handleSuccess}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar esta categoría?"
        description={`Se marcará como eliminada la categoría "${categoriaEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}