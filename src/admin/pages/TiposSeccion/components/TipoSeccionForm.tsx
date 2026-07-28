import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarTipoSeccion, crearTipoSeccion, getNextOrdenTipoSeccion } from '@/admin/services/tipo-seccion.service'
import type { TipoSeccion } from '@/admin/types/tipo-seccion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TipoSeccionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoEditar?: TipoSeccion | null
  onSuccess: () => void
}

export function TipoSeccionForm({
  open,
  onOpenChange,
  tipoEditar,
  onSuccess,
}: TipoSeccionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nuevoCampo, setNuevoCampo] = useState('')
  
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [camposMetadata, setCamposMetadata] = useState<string[]>([])
  const [icono, setIcono] = useState('')
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
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setNombre('')
      setSlug('')
      setDescripcion('')
      setCamposMetadata([])
      setIcono('')
      setOrden(0)
      setEstado('activo')
      setNuevoCampo('')
      setErrors({})
      return
    }

    if (open && tipoEditar) {
      setNombre(tipoEditar.nombre)
      setSlug(tipoEditar.slug)
      setDescripcion(tipoEditar.descripcion || '')
      setCamposMetadata(tipoEditar.campos_metadata || [])
      setIcono(tipoEditar.icono || '')
      setOrden(tipoEditar.orden)
      setEstado(tipoEditar.estado === 'eliminado' ? 'activo' : tipoEditar.estado)
    } else if (open && !tipoEditar) {
      getNextOrdenTipoSeccion().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setNombre('')
      setSlug('')
      setDescripcion('')
      setCamposMetadata([])
      setIcono('')
      setEstado('activo')
    }
  }, [open, tipoEditar])

  const agregarCampo = () => {
    const campoLimpio = nuevoCampo.trim().toLowerCase().replace(/\s+/g, '_')
    if (!campoLimpio) return
    if (camposMetadata.includes(campoLimpio)) {
      toast.error('Campo duplicado', 'Este campo ya existe en la lista')
      return
    }
    setCamposMetadata([...camposMetadata, campoLimpio])
    setNuevoCampo('')
  }

  const eliminarCampo = (campo: string) => {
    setCamposMetadata(camposMetadata.filter((c) => c !== campo))
  }

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
        await actualizarTipoSeccion({
          id: tipoEditar.id,
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          campos_metadata: camposMetadata,
          icono: icono.trim() || undefined,
          orden,
          estado,
        })
        toast.success('Tipo actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearTipoSeccion({
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          campos_metadata: camposMetadata,
          icono: icono.trim() || undefined,
          orden,
          estado,
        })
        toast.success('Tipo creado', 'El tipo de sección se registró exitosamente')
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
    setCamposMetadata([])
    setIcono('')
    setOrden(0)
    setEstado('activo')
    setNuevoCampo('')
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
      title={isEditing ? 'Editar Tipo de Sección' : 'Nuevo Tipo de Sección'}
      description={
        isEditing
          ? 'Modifica el tipo de sección'
          : 'Define un nuevo tipo de sección (Hero, Diferencial, etc.)'
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
            label="Nombre *"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Hero, Diferencial"
            error={errors.nombre}
            required
          />
          <FormField
            label="Slug *"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              if (errors.slug) setErrors({ ...errors, slug: '' })
            }}
            placeholder="hero"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'Identificador único' : 'Se genera automáticamente'}
          />
        </div>

        {/* Descripción */}
        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe este tipo de sección..."
          multiline
          rows={2}
        />

        {/* Icono */}
        <FormField
          label="Icono (Lucide)"
          name="icono"
          value={icono}
          onChange={(e) => setIcono(e.target.value)}
          placeholder="Ej: Image, Award, CheckCircle2"
          inputClassName="font-mono text-sm"
          helpText="Nombre del icono de Lucide React (opcional)"
        />

        {/* Campos Metadata Dinámicos */}
        <div className="border rounded-lg p-4 space-y-3 dark:border-gray-600 dark:bg-gray-800/50">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Campos Dinámicos (metadata)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define los campos JSONB que tendrá el contenido de este tipo. Ej: badge_text, cta_primary_text, subtitulo, stats
          </p>
          <div className="flex gap-2">
            <Input
              value={nuevoCampo}
              onChange={(e) => setNuevoCampo(e.target.value)}
              placeholder="nombre_del_campo"
              className="font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  agregarCampo()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={agregarCampo} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              Agregar
            </Button>
          </div>
          {camposMetadata.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {camposMetadata.map((campo) => (
                <Badge key={campo} variant="secondary" className="font-mono text-xs gap-1 dark:bg-gray-600 dark:text-gray-200">
                  {campo}
                  <button
                    type="button"
                    onClick={() => eliminarCampo(campo)}
                    className="ml-1 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
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