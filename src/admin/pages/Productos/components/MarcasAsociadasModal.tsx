import { toast } from '@/admin/components/shared/Toast'
import { actualizarMarcasProducto, getMarcasActivas } from '@/admin/services/producto.service'
import type { ProductoMarcaDTO } from '@/admin/types/producto'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

interface MarcasAsociadasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId: number
  marcasActuales: { id: number; nombre: string; slug: string; orden: number | null; estado: string }[]
  onSuccess: () => void
}

export function MarcasAsociadasModal({ open, onOpenChange, productoId, marcasActuales, onSuccess }: MarcasAsociadasModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [todasLasMarcas, setTodasLasMarcas] = useState<{ id: number; nombre: string; slug: string }[]>([])
  
  // Estado local para manejar las selecciones: { marcaId: { orden, estado } }
  const [selecciones, setSelecciones] = useState<Record<number, { orden: number | null; estado: 'activo' | 'inactivo' }>>({})

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getMarcasActivas().then((data) => {
        setTodasLasMarcas(data)
        
        // Inicializar selecciones basadas en las marcas actuales del producto
        const inicial: Record<number, { orden: number | null; estado: 'activo' | 'inactivo' }> = {}
        marcasActuales.forEach(m => {
          inicial[m.id] = {
            orden: m.orden,
            estado: m.estado as 'activo' | 'inactivo'
          }
        })
        setSelecciones(inicial)
        setIsLoading(false)
      })
    }
  }, [open, marcasActuales])

  const toggleMarca = (marcaId: number, checked: boolean) => {
    setSelecciones(prev => {
      const nuevo = { ...prev }
      if (checked) {
        // Al seleccionar, se marca como activo. Si no tenía orden, se le asigna 0 por defecto.
        nuevo[marcaId] = { 
          orden: nuevo[marcaId]?.orden ?? 0, 
          estado: 'activo' 
        }
      } else {
        // Al deseleccionar, se marca como inactivo (pero se mantiene el registro para historial/orden)
        nuevo[marcaId] = { 
          orden: nuevo[marcaId]?.orden ?? null, 
          estado: 'inactivo' 
        }
      }
      return nuevo
    })
  }

  const updateOrden = (marcaId: number, orden: string) => {
    const valor = orden === '' ? null : Number(orden)
    setSelecciones(prev => ({
      ...prev,
      [marcaId]: { ...prev[marcaId], orden: valor }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convertir el objeto de selecciones a un array para enviar al servicio
      const datosAGuardar: ProductoMarcaDTO[] = Object.entries(selecciones).map(([marcaIdStr, datos]) => ({
        marca_id: Number(marcaIdStr),
        orden: datos.orden,
        estado: datos.estado
      }))

      await actualizarMarcasProducto(productoId, datosAGuardar)
      toast.success('Marcas actualizadas', 'Las asociaciones se guardaron correctamente')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudieron guardar las marcas')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Marcas Asociadas</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Selecciona las marcas y define su orden de visualización. Al desmarcar, la marca se establecerá como inactiva.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Cargando marcas...</div>
          ) : (
            <div className="space-y-3">
              {todasLasMarcas.map((marca) => {
                const seleccion = selecciones[marca.id]
                const isSelected = seleccion?.estado === 'activo'

                return (
                  <div key={marca.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id={`marca-${marca.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleMarca(marca.id, checked as boolean)}
                      />
                      <Label htmlFor={`marca-${marca.id}`} className="cursor-pointer font-medium dark:text-gray-200 flex-1">
                        {marca.nombre}
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Orden:</Label>
                      <Input
                        type="number"
                        className="w-20 h-8 text-sm dark:bg-gray-800 dark:border-gray-600"
                        value={seleccion?.orden ?? ''}
                        onChange={(e) => updateOrden(marca.id, e.target.value)}
                        disabled={!isSelected}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-[#EA0A2A] hover:bg-[#c90825]">
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}