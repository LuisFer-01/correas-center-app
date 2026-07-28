import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarTipoAtributo, crearTipoAtributo, getNextOrdenTipoAtributo } from '@/admin/services/tipo-atributo.service'
import type { TipoAtributo } from '@/admin/types/tipo-atributo'
import { useEffect, useState } from 'react'

interface TipoAtributoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoEditar?: TipoAtributo | null
  onSuccess: () => void
}

export function TipoAtributoForm({
  open,
  onOpenChange,
  tipoEditar,
  onSuccess,
}: TipoAtributoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('')
  const [permiteDescripcion, setPermiteDescripcion] = useState(false)
  const [permiteValorNumerico, setPermiteValorNumerico] = useState(false)
  const [permiteUnidadMedida, setPermiteUnidadMedida] = useState(false)
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!tipoEditar

  // Auto-generar slug desde el nombre (solo en creación)
  useEffect(() => {
    if (!isEditing && nombre) {
      const slugGenerado = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^_+|_+$/g, '')
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setNombre('')
      setSlug('')
      setDescripcion('')
      setIcono('')
      setPermiteDescripcion(false)
      setPermiteValorNumerico(false)
      setPermiteUnidadMedida(false)
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && tipoEditar) {
      setNombre(tipoEditar.nombre)
      setSlug(tipoEditar.slug)
      setDescripcion(tipoEditar.descripcion || '')
      setIcono(tipoEditar.icono || '')
      setPermiteDescripcion(tipoEditar.permite_descripcion)
      setPermiteValorNumerico(tipoEditar.permite_valor_numerico)
      setPermiteUnidadMedida(tipoEditar.permite_unidad_medida)
      setOrden(tipoEditar.orden)
      setEstado(tipoEditar.estado === 'eliminado' ? 'activo' : tipoEditar.estado)
    } else if (open && !tipoEditar) {
      getNextOrdenTipoAtributo().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setNombre('')
      setSlug('')
      setDescripcion('')
      setIcono('')
      setPermiteDescripcion(false)
      setPermiteValorNumerico(false)
      setPermiteUnidadMedida(false)
      setEstado('activo')
    }
  }, [open, tipoEditar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    if (!slug.trim()) newErrors.slug = 'El slug es obligatorio'
    else if (!/^[a-z0-9_-]+$/.test(slug)) newErrors.slug = 'Solo minúsculas, números, guiones y guiones bajos'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && tipoEditar) {
        await actualizarTipoAtributo({
          id: tipoEditar.id,
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          icono: icono.trim() || undefined,
          permite_descripcion: permiteDescripcion,
          permite_valor_numerico: permiteValorNumerico,
          permite_unidad_medida: permiteUnidadMedida,
          orden,
          estado,
        })
        toast.success('Tipo actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearTipoAtributo({
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          icono: icono.trim() || undefined,
          permite_descripcion: permiteDescripcion,
          permite_valor_numerico: permiteValorNumerico,
          permite_unidad_medida: permiteUnidadMedida,
          orden,
          estado,
        })
        toast.success('Tipo creado', 'El tipo de atributo se registró exitosamente')
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
    setNombre('')
    setSlug('')
    setDescripcion('')
    setIcono('')
    setPermiteDescripcion(false)
    setPermiteValorNumerico(false)
    setPermiteUnidadMedida(false)
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
      title={isEditing ? 'Editar Tipo de Atributo' : 'Nuevo Tipo de Atributo'}
      description={
        isEditing
          ? 'Modifica la configuración del tipo de atributo'
          : 'Define un nuevo tipo de atributo técnico'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Tipo'}
    >
      <div className="space-y-4">
        {/* Nombre y Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre del Tipo"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Dimensión, Material, Color"
            error={errors.nombre}
            required
          />
          <FormField
            label="Slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              if (errors.slug) setErrors({ ...errors, slug: '' })
            }}
            placeholder="dimension"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText="Identificador único (se genera automáticamente)"
          />
        </div>

        {/* Descripción */}
        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el propósito de este tipo de atributo..."
          multiline
          rows={3}
        />

        {/* Icono */}
        <FormField
          label="Icono (Lucide)"
          name="icono"
          value={icono}
          onChange={(e) => setIcono(e.target.value)}
          placeholder="Ej: Ruler, Wrench, ListChecks"
          inputClassName="font-mono text-sm"
          helpText="Nombre del icono de Lucide React (opcional)"
        />

        {/* Configuración de Opciones */}
        <div className="border rounded-lg p-4 space-y-3 dark:border-gray-600 dark:bg-gray-800/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Configuración del Tipo
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Estas opciones definen qué campos estarán disponibles al crear atributos de este tipo
          </p>
          <div className="space-y-2 pt-2">
            <CheckboxField
              label="Permite descripción"
              name="permite_descripcion"
              checked={permiteDescripcion}
              onCheckedChange={setPermiteDescripcion}
              description="El atributo podrá tener una descripción detallada"
            />
            <CheckboxField
              label="Permite valor numérico"
              name="permite_valor_numerico"
              checked={permiteValorNumerico}
              onCheckedChange={setPermiteValorNumerico}
              description="El atributo podrá tener un valor numérico"
            />
            <CheckboxField
              label="Permite unidad de medida"
              name="permite_unidad_medida"
              checked={permiteUnidadMedida}
              onCheckedChange={setPermiteUnidadMedida}
              description="El atributo podrá especificar una unidad de medida"
            />
          </div>
        </div>

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Los tipos se muestran en orden ascendente"
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