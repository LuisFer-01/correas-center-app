import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
  eliminarMenu,
  getMenus,
  restaurarMenu,
} from '@/admin/services/menu.service'
import type { Menu } from '@/admin/types/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Settings2, Trash2 } from 'lucide-react'; // ✅ Settings2 agregado
import { useEffect, useState } from 'react'
import { MenuForm } from './components/MenuForm'
import { SubcategoriesManager } from './components/SubcategoriesManager'; // ✅ NUEVO

export const MenusIndex = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para Menú Principal
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false)
  const [menuEditar, setMenuEditar] = useState<Menu | null>(null)
  
  // ✅ NUEVOS Estados para el Modal de Subcategorías
  const [isSubcategoriesOpen, setIsSubcategoriesOpen] = useState(false)
  const [selectedMenuForSubcategories, setSelectedMenuForSubcategories] = useState<Menu | null>(null)
  
  // Estados para Eliminación
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [menuEliminar, setMenuEliminar] = useState<Menu | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [showDeleted, setShowDeleted] = useState(false)

  const loadMenus = async () => {
    setIsLoading(true)
    try {
      const data = await getMenus(true) // Incluir eliminados
      setMenus(data)
    } catch (error) {
      console.error('Error al cargar menús:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los menús')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMenus()
  }, [])

  const handleNuevoMenu = () => {
    setMenuEditar(null)
    setIsMenuFormOpen(true)
  }

  const handleEditarMenu = (menu: Menu) => {
    setMenuEditar(menu)
    setIsMenuFormOpen(true)
  }

  // ✅ NUEVA FUNCIÓN: Abrir modal de subcategorías
  const handleManageSubcategories = (menu: Menu) => {
    setSelectedMenuForSubcategories(menu)
    setIsSubcategoriesOpen(true)
  }

  const handleEliminarClick = (menu: Menu) => {
    setMenuEliminar(menu)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!menuEliminar) return
    setIsDeleting(true)
    try {
      await eliminarMenu(menuEliminar.id)
      toast.success('Menú eliminado', 'El menú se marcó como eliminado')
      setIsDeleteOpen(false)
      setMenuEliminar(null)
      await loadMenus()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (menu: Menu) => {
    try {
      await restaurarMenu(menu.id)
      toast.success('Menú restaurado', 'El menú volvió a estado activo')
      await loadMenus()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsMenuFormOpen(false)
    setMenuEditar(null)
    loadMenus()
  }

  // Filtrar menús según si mostrar eliminados
  const filteredMenus = menus.filter((m) => {
    if (m.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Menu>[] = [
    {
      accessorKey: 'grupo',
      header: 'Menú Principal',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            {row.original.icono && (
              <span className="text-[#EA0A2A]">
                {/* Aquí podrías renderizar tu componente Icon si lo tienes importado, o dejar el texto */}
                {row.original.icono}
              </span>
            )}
            {row.getValue('grupo')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {row.original.ruta}
          </div>
        </div>
      ),
    },
    {
      id: 'tipo_registro',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.original.tipo_registro}
        </Badge>
      ),
    },
    {
      id: 'menu_items',
      header: 'Subcategorías',
      cell: ({ row }) => {
        const menu = row.original
        const count = menu.menu_items?.length || 0
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {count}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-[#EA0A2A] dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => handleManageSubcategories(menu)}
              title="Gestionar subcategorías"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
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
        const menu = row.original

        if (menu.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(menu)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="menus.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarMenu(menu)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="menus.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(menu)}
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
        title="Menús de Navegación"
        description="Gestiona los menús principales y sus subcategorías"
        actions={
          <>
            <RequirePermission permission="menus.view_deleted">
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
            <RequirePermission permission="menus.create">
              <Button
                onClick={handleNuevoMenu}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Menú
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredMenus}
        searchKey="grupo"
        searchPlaceholder="Buscar menús..."
        isLoading={isLoading}
      />

      <MenuForm
        open={isMenuFormOpen}
        onOpenChange={setIsMenuFormOpen}
        menuEditar={menuEditar}
        onSuccess={handleSuccess}
      />

      {/* ✅ NUEVO: Modal de Gestión de Subcategorías */}
      <SubcategoriesManager
        open={isSubcategoriesOpen}
        onOpenChange={setIsSubcategoriesOpen}
        menu={selectedMenuForSubcategories}
        onSuccess={loadMenus}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este menú?"
        description={`Se marcará como eliminado el menú "${menuEliminar?.grupo}" y todas sus subcategorías asociadas.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}