import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMenuItem, crearMenuItem, getNextOrdenMenuItem } from '@/admin/services/menu.service'
import { useEffect, useState } from 'react'

interface MenuItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuId: number
  menuItemEditar?: { id: number; ruta: string; orden: number; estado: string } | null
  onSuccess: () => void
}

export function MenuItemForm({
  open,
  onOpenChange,
  menuId,
  menuItemEditar,
  onSuccess,
}: MenuItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [ruta, setRuta] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!menuItemEditar

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setRuta('')
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && menuItemEditar) {
      setRuta(menuItemEditar.ruta)
      setOrden(menuItemEditar.orden)
      setEstado(menuItemEditar.estado === 'eliminado' ? 'activo' : menuItemEditar.estado)
    } else if (open && !menuItemEditar) {
      getNextOrdenMenuItem(menuId).then((nextOrden) => {
        setOrden(nextOrden)
      })
      setRuta('')
      setEstado('activo')
    }
  }, [open, menuItemEditar, menuId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!ruta.trim()) newErrors.ruta = 'La ruta es obligatoria'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && menuItemEditar) {
        await actualizarMenuItem({
          id: menuItemEditar.id,
          menu_id: menuId,
          ruta: ruta.trim(),
          orden,
          estado,
        })
        toast.success('Subcategoría actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearMenuItem({
          menu_id: menuId,
          ruta: ruta.trim(),
          orden,
          estado,
        })
        toast.success('Subcategoría creada', 'La subcategoría se agregó exitosamente')
      }
      
      onSuccess()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al guardar', error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setRuta('')
    setOrden(0)
    setEstado('activo')
    setErrors({})
    onOpenChange(false)
  }

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
      description={isEditing ? 'Modifica la subcategoría del menú' : 'Agrega una subcategoría al menú principal'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Agregar Subcategoría'}
    >
      <div className="space-y-4">
        <FormField
          label="Ruta de la Subcategoría"
          name="ruta"
          value={ruta}
          onChange={(e) => {
            setRuta(e.target.value)
            if (errors.ruta) setErrors({ ...errors, ruta: '' })
          }}
          placeholder="Ej: /products/correas/correas-lisas"
          error={errors.ruta}
          required
          helpText="La URL específica de esta subcategoría"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Orden"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Se autocompleta con el siguiente disponible"
          />
          <SelectField
            label="Estado"
            name="estado"
            value={estado}
            onValueChange={(val) => setEstado(val as 'activo' | 'inactivo')}
            options={estadoOptions}
          />
        </div>
      </div>
    </FormShell>
  )
}