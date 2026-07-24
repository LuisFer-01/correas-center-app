import { toast } from '@/admin/components/shared/Toast'
import { eliminarMenuItem } from '@/admin/services/menu.service'
import type { Menu, MenuItem } from '@/admin/types/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { MenuItemForm } from './MenuItemForm'

interface SubcategoriesManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu: Menu | null
  onSuccess: () => void
}

export function SubcategoriesManager({ open, onOpenChange, menu, onSuccess }: SubcategoriesManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!menu) return null

  const handleAdd = () => {
    setItemToEdit(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: MenuItem) => {
    setItemToEdit(item)
    setIsFormOpen(true)
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`¿Estás seguro de eliminar la subcategoría "${item.ruta}"?`)) return
    setIsDeleting(true)
    try {
      await eliminarMenuItem(item.id)
      toast.success('Subcategoría eliminada', 'Se marcó como eliminada correctamente')
      onSuccess() // Recargar la lista en el padre
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setItemToEdit(null)
    onSuccess()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] dark:bg-gray-800 dark:border-gray-600">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Gestionar Subcategorías</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Menú: <span className="font-semibold text-[#EA0A2A]">{menu.grupo}</span> ({menu.ruta})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Subcategorías asignadas ({menu.menu_items?.length || 0})
              </h3>
              <Button onClick={handleAdd} size="sm" className="bg-[#EA0A2A] hover:bg-[#c90825]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            <div className="border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800/50">
              {menu.menu_items && menu.menu_items.length > 0 ? (
                <div className="divide-y dark:divide-gray-600">
                  {menu.menu_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{item.ruta}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            Orden: {item.orden}
                          </Badge>
                          <Badge variant={item.estado === 'activo' ? 'default' : 'secondary'} className="text-xs">
                            {item.estado}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No hay subcategorías asignadas a este menú.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFormOpen && (
        <MenuItemForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          menuId={menu.id}
          parentRoute={menu.ruta}
          menuItemEditar={itemToEdit}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  )
}