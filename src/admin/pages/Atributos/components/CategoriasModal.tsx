import { toast } from '@/admin/components/shared/Toast'
import { actualizarCategoriasAtributo, getCategoriasActivas } from '@/admin/services/atributo.service'
import type { AtributoTecnico } from '@/admin/types/atributo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

interface CategoriasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  atributo: AtributoTecnico | null
  onSuccess: () => void
}

export function CategoriasModal({ open, onOpenChange, atributo, onSuccess }: CategoriasModalProps) {
  const [categorias, setCategorias] = useState<{ id: number; nombre: string; slug: string }[]>([])
  const [categoriaIds, setCategoriaIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar categorías disponibles
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getCategoriasActivas().then((data) => {
        setCategorias(data)
        setIsLoading(false)
      })
    }
  }, [open])

  // Cargar categorías asignadas al atributo
  useEffect(() => {
    if (atributo && open) {
      const ids = atributo.categorias?.map((c) => c.id) || []
      setCategoriaIds(ids)
    }
  }, [atributo, open])

  const toggleCategoria = (categoriaId: number) => {
    setCategoriaIds((prev) =>
      prev.includes(categoriaId)
        ? prev.filter((id) => id !== categoriaId)
        : [...prev, categoriaId]
    )
  }

  const handleGuardar = async () => {
    if (!atributo) return
    setIsSaving(true)
    try {
      await actualizarCategoriasAtributo(atributo.id, categoriaIds)
      toast.success('Categorías actualizadas', 'Las categorías se actualizaron correctamente')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudieron actualizar las categorías')
    } finally {
      setIsSaving(false)
    }
  }

  if (!atributo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-gray-700 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Categorías Asignadas
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Atributo: <span className="font-semibold">{atributo.nombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando categorías...
            </div>
          ) : categorias.length > 0 ? (
            <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800/50 max-h-80 overflow-y-auto">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`categoria-${categoria.id}`}
                    checked={categoriaIds.includes(categoria.id)}
                    onCheckedChange={() => toggleCategoria(categoria.id)}
                  />
                  <Label
                    htmlFor={`categoria-${categoria.id}`}
                    className="text-sm font-normal cursor-pointer flex-1 dark:text-gray-200"
                  >
                    {categoria.nombre}
                  </Label>
                  {categoriaIds.includes(categoria.id) && (
                    <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                      Asignada
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay categorías disponibles
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {categoriaIds.length} {categoriaIds.length === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={isSaving}
            className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}