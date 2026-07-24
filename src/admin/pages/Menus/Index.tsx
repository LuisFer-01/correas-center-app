import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarMenu,
    eliminarMenuItem,
    getMenus,
    restaurarMenu,
} from '@/admin/services/menu.service'
import type { Menu } from '@/admin/types/menu'
import Icon from '@/components/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MenuForm } from './components/MenuForm'
import { MenuItemForm } from './components/MenuItemForm'

export const MenusIndex = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para Menú Principal
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false)
  const [menuEditar, setMenuEditar] = useState<Menu | null>(null)
  
  // Estados para Subcategoría (MenuItem)
  const [isMenuItemFormOpen, setIsMenuItemFormOpen] = useState(false)
  const [menuItemSelected, setMenuItemSelected] = useState<number | null>(null)
  const [menuItemEditar, setMenuItemEditar] = useState<any>(null)
  
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

  const handleAgregarItem = (menuId: number) => {
    setMenuItemSelected(menuId)
    setMenuItemEditar(null)
    setIsMenuItemFormOpen(true)
  }

  const handleEditarItem = (menuId: number, item: any) => {
    setMenuItemSelected(menuId)
    setMenuItemEditar(item)
    setIsMenuItemFormOpen(true)
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

  const handleEliminarItem = async (menuId: number, itemId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta subcategoría?')) return
    try {
      await eliminarMenuItem(itemId)
      toast.success('Subcategoría eliminada', 'La subcategoría se marcó como eliminada')
      await loadMenus()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
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
    setIsMenuItemFormOpen(false)
    setMenuEditar(null)
    setMenuItemEditar(null)
    setMenuItemSelected(null)
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
              <Icon name={row.original.icono} size="sm" className="text-[#EA0A2A]" />
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
      cell: ({ row }) => (
        <div className="space-y-2">
          {row.original.menu_items && row.original.menu_items.length > 0 ? (
            row.original.menu_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                <span className="text-gray-700 dark:text-gray-300 truncate flex-1 font-mono">{item.ruta}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleEditarItem(row.original.id, item)}
                    title="Editar"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => handleEliminarItem(row.original.id, item.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Sin subcategorías</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs mt-1 text-[#EA0A2A] hover:text-[#c90825] hover:bg-[#EA0A2A]/10"
            onClick={() => handleAgregarItem(row.original.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar Subcategoría
          </Button>
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

      {menuItemSelected && (
        <MenuItemForm
          open={isMenuItemFormOpen}
          onOpenChange={setIsMenuItemFormOpen}
          menuId={menuItemSelected}
          menuItemEditar={menuItemEditar}
          onSuccess={handleSuccess}
        />
      )}

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