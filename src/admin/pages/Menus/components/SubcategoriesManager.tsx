import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMenuItemEstado, restaurarMenuItem } from '@/admin/services/menu.service'
import type { Menu, MenuItem } from '@/admin/types/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
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
  const [showDeleted, setShowDeleted] = useState(false)

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
      // Soft delete: solo cambia el estado a 'eliminado'
      await actualizarMenuItemEstado(item.id, 'eliminado')
      toast.success('Subcategoría eliminada', 'Se marcó como eliminada correctamente')
      onSuccess()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleEstado = async (item: MenuItem) => {
    const nuevoEstado = item.estado === 'activo' ? 'inactivo' : 'activo'
    try {
      await actualizarMenuItemEstado(item.id, nuevoEstado)
      toast.success('Estado actualizado', `Subcategoría ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'}`)
      onSuccess()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo actualizar el estado')
    }
  }

  const handleRestaurar = async (item: MenuItem) => {
    try {
      await restaurarMenuItem(item.id)
      toast.success('Subcategoría restaurada', 'Volvió a estado activo')
      onSuccess()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo restaurar')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setItemToEdit(null)
    onSuccess()
  }

  // ✅ Filtrar y ordenar subcategorías respetando el campo 'orden'
  const menuItemsFiltrados = (menu.menu_items || [])
    .filter((item) => (item.estado === 'eliminado' ? showDeleted : true))
    .sort((a, b) => a.orden - b.orden)

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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Subcategorías ({menuItemsFiltrados.length})
                </h3>
                <RequirePermission permission="menu_items.view_deleted">
                  <Button
                    variant={showDeleted ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowDeleted(!showDeleted)}
                    className="h-8"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {showDeleted ? 'Ocultar' : 'Ver Eliminados'}
                  </Button>
                </RequirePermission>
              </div>
              <Button onClick={handleAdd} size="sm" className="bg-[#EA0A2A] hover:bg-[#c90825]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            <div className="border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800/50">
              {menuItemsFiltrados.length > 0 ? (
                <div className="divide-y dark:divide-gray-600">
                  {menuItemsFiltrados.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate">{item.ruta}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            Orden: {item.orden}
                          </Badge>
                          <Badge 
                            variant={item.estado === 'activo' ? 'default' : item.estado === 'inactivo' ? 'secondary' : 'destructive'} 
                            className="text-xs"
                          >
                            {item.estado}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.estado === 'eliminado' ? (
                          <RequirePermission permission="menu_items.update">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                              onClick={() => handleRestaurar(item)}
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </RequirePermission>
                        ) : (
                          <>
                            <RequirePermission permission="menu_items.update">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                onClick={() => handleToggleEstado(item)}
                                title={item.estado === 'activo' ? 'Desactivar' : 'Activar'}
                              >
                                {item.estado === 'activo' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 0-16 0"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/></svg>
                                )}
                              </Button>
                            </RequirePermission>
                            <RequirePermission permission="menu_items.update">
                              <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-600" onClick={() => handleEdit(item)} title="Editar">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </RequirePermission>
                            <RequirePermission permission="menu_items.delete">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => handleDelete(item)}
                                disabled={isDeleting}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </RequirePermission>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {showDeleted ? 'No hay subcategorías eliminadas.' : 'No hay subcategorías asignadas a este menú.'}
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