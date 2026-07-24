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
  parentRoute?: string // ✅ NUEVO: Ruta del menú padre
  menuItemEditar?: { id: number; ruta: string; orden: number; estado: string } | null
  onSuccess: () => void
}

export function MenuItemForm({
  open,
  onOpenChange,
  menuId,
  parentRoute,
  menuItemEditar,
  onSuccess,
}: MenuItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suffix, setSuffix] = useState('') // ✅ NUEVO: Solo la parte final de la ruta
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!menuItemEditar

  // Helper para extraer el sufijo de una ruta completa
  const getSuffix = (fullRoute: string, parent: string) => {
    if (!parent) return fullRoute
    const cleanParent = parent.replace(/\/$/, '')
    if (fullRoute.startsWith(cleanParent + '/')) {
      return fullRoute.substring((cleanParent + '/').length)
    }
    return fullRoute
  }

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setSuffix('')
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && menuItemEditar) {
      setSuffix(getSuffix(menuItemEditar.ruta, parentRoute || ''))
      setOrden(menuItemEditar.orden)
      setEstado(menuItemEditar.estado === 'eliminado' ? 'activo' : menuItemEditar.estado)
    } else if (open && !menuItemEditar) {
      getNextOrdenMenuItem(menuId).then((nextOrden) => {
        setOrden(nextOrden)
      })
      setSuffix('')
      setEstado('activo')
    }
  }, [open, menuItemEditar, menuId, parentRoute])

  // Sincronizar el valor real de la ruta en el formulario para la validación
  useEffect(() => {
    if (parentRoute) {
      const cleanParent = parentRoute.replace(/\/$/, '')
      const cleanSuffix = suffix.replace(/^\//, '').trim()
      const finalRoute = cleanSuffix ? `${cleanParent}/${cleanSuffix}` : cleanParent
      // Actualizamos un campo oculto o validamos manualmente, aquí lo usamos directo en onSubmit
    }
  }, [suffix, parentRoute])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const cleanSuffix = suffix.replace(/^\//, '').trim()
    if (!cleanSuffix && !parentRoute) newErrors.suffix = 'La ruta es obligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // ✅ Construir la ruta final concatenada
      const cleanParent = parentRoute?.replace(/\/$/, '') || ''
      const cleanSuffix = suffix.replace(/^\//, '').trim()
      const finalRoute = cleanSuffix ? `${cleanParent}/${cleanSuffix}` : cleanParent

      if (isEditing && menuItemEditar) {
        await actualizarMenuItem({
          id: menuItemEditar.id,
          menu_id: menuId,
          ruta: finalRoute,
          orden,
          estado,
        })
        toast.success('Subcategoría actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearMenuItem({
          menu_id: menuId,
          ruta: finalRoute,
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
    setSuffix('')
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
        {/* ✅ Input de Ruta con Prefijo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Ruta de la Subcategoría *
          </label>
          {parentRoute ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600">
                {parentRoute.replace(/\/$/, '')}/
              </span>
              <input
                type="text"
                value={suffix}
                onChange={(e) => {
                  setSuffix(e.target.value)
                  if (errors.suffix) setErrors({ ...errors, suffix: '' })
                }}
                placeholder="correas-lisas"
                className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 outline-none"
              />
            </div>
          ) : (
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Ej: /products/correas/correas-lisas"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 outline-none"
            />
          )}
          {errors.suffix && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.suffix}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {parentRoute 
              ? 'Escribe solo la parte final de la ruta. Se concatenará automáticamente con la ruta del menú padre.' 
              : 'La URL específica de esta subcategoría'}
          </p>
        </div>

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