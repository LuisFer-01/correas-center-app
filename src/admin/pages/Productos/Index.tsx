import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import { DataTableSkeleton } from '@/admin/components/skeletons/DataTableSkeleton'
import {
  eliminarProducto,
  getProductos,
  restaurarProducto,
} from '@/admin/services/producto.service'
import type { Producto } from '@/admin/types/producto'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { CirclePlus, Eye, Package, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MarcasAsociadasModal } from './components/MarcasAsociadasModal'
import { ProductoForm } from './components/ProductoForm'

export const ProductosIndex = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [isMarcasModalOpen, setIsMarcasModalOpen] = useState(false)
  const [productoParaMarcas, setProductoParaMarcas] = useState<Producto | null>(null)

  const loadProductos = async () => {
    setIsLoading(true)
    try {
      const data = await getProductos(true)
      setProductos(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los productos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProductos()
  }, [])

  const handleNuevoProducto = () => {
    setProductoEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarProducto = (producto: Producto) => {
    setProductoEditar(producto)
    setIsFormOpen(true)
  }

  const handleGestionarMarcas = (producto: Producto) => {
    setProductoParaMarcas(producto)
    setIsMarcasModalOpen(true)
  }

  const handleEliminarClick = (producto: Producto) => {
    setProductoEliminar(producto)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!productoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarProducto(productoEliminar.id)
      toast.success('Producto eliminado', 'El producto se marcó como eliminado')
      setIsDeleteOpen(false)
      setProductoEliminar(null)
      await loadProductos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (producto: Producto) => {
    try {
      await restaurarProducto(producto.id)
      toast.success('Producto restaurado', 'El producto volvió a estado activo')
      await loadProductos()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setProductoEditar(null)
    loadProductos()
  }

  const handleMarcasSuccess = () => {
    setIsMarcasModalOpen(false)
    setProductoParaMarcas(null)
    loadProductos()
  }

  const filteredProductos = productos.filter((p) => {
    if (p.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Producto>[] = [
    {
      accessorKey: 'imagen',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage src={row.original.imagen ?? undefined} alt={row.original.nombre} className="object-contain p-1" />
          <AvatarFallback className="bg-[#EA0A2A] text-white rounded-lg">
            <Package className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.getValue('nombre')}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: 'marcas',
      header: 'Marcas',
      cell: ({ row }) => {
        const producto = row.original
        const marcasActivas = (producto.marcas || [])
          .filter(m => m.estado === 'activo')
          .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
        const marcasParaMostrar = marcasActivas.slice(0, 3)
        const hayMas = marcasActivas.length > 3
        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1 items-center">
              {marcasParaMostrar.map((marca) => (
                <Badge key={marca.id} variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                  {marca.nombre}
                </Badge>
              ))}
              {hayMas && (
                <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  +{marcasActivas.length - 3}
                </Badge>
              )}
              {marcasActivas.length === 0 && (
                <span className="text-sm text-gray-400 italic">Sin marcas</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#EA0A2A] hover:text-[#c90825] hover:bg-[#EA0A2A]/10"
                onClick={() => handleGestionarMarcas(producto)}
                title="Gestionar marcas asociadas"
              >
                <CirclePlus className="h-4 w-4" />
              </Button>
            </div>
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
        const producto = row.original
        if (producto.estado === 'eliminado') {
          return (
            <Button variant="outline" size="sm" onClick={() => handleRestaurar(producto)} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              <RotateCcw className="h-4 w-4 mr-2" /> Restaurar
            </Button>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="productos.update">
              <Button variant="ghost" size="icon" onClick={() => handleEditarProducto(producto)} title="Editar" className="dark:text-gray-300 dark:hover:bg-gray-700">
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="productos.delete">
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleEliminarClick(producto)} title="Eliminar">
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
        title="Productos"
        description="Gestiona el catálogo de productos del sistema"
        actions={
          <>
            <RequirePermission permission="productos.view_deleted">
              <Button variant={showDeleted ? 'default' : 'outline'} size="sm" onClick={() => setShowDeleted(!showDeleted)} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                <Eye className="h-4 w-4 mr-2" /> {showDeleted ? 'Ocultar Eliminados' : 'Ver Eliminados'}
              </Button>
            </RequirePermission>
            <RequirePermission permission="productos.create">
              <Button onClick={handleNuevoProducto} className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
              </Button>
            </RequirePermission>
          </>
        }
      />

      {/* ✅ NUEVO: Mostrar skeleton mientras carga */}
      {isLoading ? (
        <DataTableSkeleton columns={6} rows={8} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredProductos}
          searchKey="nombre"
          searchPlaceholder="Buscar productos..."
          isLoading={isLoading}
        />
      )}

      <ProductoForm open={isFormOpen} onOpenChange={setIsFormOpen} productoEditar={productoEditar} onSuccess={handleSuccess} />
      {productoParaMarcas && (
        <MarcasAsociadasModal
          open={isMarcasModalOpen}
          onOpenChange={setIsMarcasModalOpen}
          productoId={productoParaMarcas.id}
          marcasActuales={productoParaMarcas.marcas || []}
          onSuccess={handleMarcasSuccess}
        />
      )}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este producto?"
        description={`Se marcará como eliminado el producto "${productoEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}