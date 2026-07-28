import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarAtributo, crearAtributo, getNextOrdenAtributo, getTiposAtributoActivos } from '@/admin/services/atributo.service'
import type { AtributoTecnico } from '@/admin/types/atributo'
import { useEffect, useState } from 'react'

interface AtributoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  atributoEditar?: AtributoTecnico | null
  onSuccess: () => void
}

export function AtributoForm({
  open,
  onOpenChange,
  atributoEditar,
  onSuccess,
}: AtributoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tipos, setTipos] = useState<any[]>([])
  const [tiposLoaded, setTiposLoaded] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<any>(null)

  const [tipoAtributoId, setTipoAtributoId] = useState<number>(0)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [valorNumerico, setValorNumerico] = useState<string>('')
  const [unidadMedida, setUnidadMedida] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!atributoEditar

  // Cargar tipos de atributo
  useEffect(() => {
    if (open && !tiposLoaded) {
      getTiposAtributoActivos().then((data) => {
        setTipos(data)
        setTiposLoaded(true)
      })
    }
  }, [open, tiposLoaded])

  // Actualizar tipo seleccionado cuando cambia
  useEffect(() => {
    if (tipoAtributoId > 0) {
      const tipo = tipos.find((t) => t.id === tipoAtributoId)
      setTipoSeleccionado(tipo || null)
    } else {
      setTipoSeleccionado(null)
    }
  }, [tipoAtributoId, tipos])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setTipoAtributoId(0)
      setNombre('')
      setDescripcion('')
      setValorNumerico('')
      setUnidadMedida('')
      setOrden(0)
      setEstado('activo')
      setTipoSeleccionado(null)
      setErrors({})
      return
    }

    if (open && atributoEditar) {
      setTipoAtributoId(atributoEditar.tipo_atributo_id)
      setNombre(atributoEditar.nombre)
      setDescripcion(atributoEditar.descripcion || '')
      setValorNumerico(atributoEditar.valor_numerico?.toString() || '')
      setUnidadMedida(atributoEditar.unidad_medida || '')
      setOrden(atributoEditar.orden)
      setEstado(atributoEditar.estado === 'eliminado' ? 'activo' : atributoEditar.estado)
    } else if (open && tipos.length > 0 && !atributoEditar) {
      getNextOrdenAtributo().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setTipoAtributoId(tipos[0]?.id || 0)
      setNombre('')
      setDescripcion('')
      setValorNumerico('')
      setUnidadMedida('')
      setEstado('activo')
    }
  }, [open, atributoEditar, tipos])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!tipoAtributoId) newErrors.tipo_atributo_id = 'Selecciona un tipo de atributo'
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        tipo_atributo_id: tipoAtributoId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        valor_numerico: valorNumerico ? parseFloat(valorNumerico) : undefined,
        unidad_medida: unidadMedida.trim() || undefined,
        orden,
        estado,
        categoria_ids: [], // ✅ Se envía vacío, se gestionará desde el modal
      }

      if (isEditing && atributoEditar) {
        await actualizarAtributo({ id: atributoEditar.id, ...payload })
        toast.success('Atributo actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearAtributo(payload)
        toast.success('Atributo creado', 'El atributo técnico se registró exitosamente')
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
    setTipoAtributoId(0)
    setNombre('')
    setDescripcion('')
    setValorNumerico('')
    setUnidadMedida('')
    setOrden(0)
    setEstado('activo')
    setTipoSeleccionado(null)
    setErrors({})
    onOpenChange(false)
  }

  const tiposOptions = tipos.map((t) => ({
    value: t.id.toString(),
    label: t.nombre,
  }))

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Atributo Técnico' : 'Nuevo Atributo Técnico'}
      description={
        isEditing
          ? 'Modifica la información del atributo'
          : 'Registra un nuevo atributo técnico para productos'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Atributo'}
    >
      <div className="space-y-4">
        {/* Tipo de Atributo */}
        <SelectField
          label="Tipo de Atributo"
          name="tipo_atributo_id"
          value={tipoAtributoId.toString()}
          onValueChange={(val) => setTipoAtributoId(Number(val))}
          options={tiposOptions}
          placeholder="Selecciona un tipo"
          error={errors.tipo_atributo_id}
          required
        />

        {/* Indicador de campos permitidos */}
        {tipoSeleccionado && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
              Este tipo permite:
            </p>
            <div className="flex flex-wrap gap-1">
              {tipoSeleccionado.permite_descripcion && (
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded">
                  Descripción
                </span>
              )}
              {tipoSeleccionado.permite_valor_numerico && (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded">
                  Valor numérico
                </span>
              )}
              {tipoSeleccionado.permite_unidad_medida && (
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded">
                  Unidad de medida
                </span>
              )}
              {!tipoSeleccionado.permite_descripcion && !tipoSeleccionado.permite_valor_numerico && !tipoSeleccionado.permite_unidad_medida && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Solo nombre
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nombre */}
        <FormField
          label="Nombre del Atributo"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errors.nombre) setErrors({ ...errors, nombre: '' })
          }}
          placeholder="Ej: Diámetro exterior"
          error={errors.nombre}
          required
        />

        {/* Descripción (condicional) */}
        {tipoSeleccionado?.permite_descripcion && (
          <FormField
            label="Descripción"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del atributo..."
            multiline
            rows={3}
          />
        )}

        {/* Valor Numérico y Unidad de Medida (condicionales) */}
        {(tipoSeleccionado?.permite_valor_numerico || tipoSeleccionado?.permite_unidad_medida) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tipoSeleccionado?.permite_valor_numerico && (
              <FormField
                label="Valor Numérico"
                name="valor_numerico"
                type="number"
                value={valorNumerico}
                onChange={(e) => setValorNumerico(e.target.value)}
                placeholder="Ej: 150.5"
                helpText="Usa punto para decimales"
              />
            )}
            {tipoSeleccionado?.permite_unidad_medida && (
              <FormField
                label="Unidad de Medida"
                name="unidad_medida"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                placeholder="Ej: mm, kg, m²"
              />
            )}
          </div>
        )}

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Los atributos se muestran en orden ascendente"
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