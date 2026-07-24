import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMarca, crearMarca, generarSlug, getNextOrdenMarca } from '@/admin/services/marca.service'
import type { Marca } from '@/admin/types/marca'
import { useEffect, useState } from 'react'

interface MarcaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marcaEditar?: Marca | null
  onSuccess: () => void
}

export function MarcaForm({
  open,
  onOpenChange,
  marcaEditar,
  onSuccess,
}: MarcaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!marcaEditar

  // Auto-generar slug desde el nombre (solo en creación)
  useEffect(() => {
    if (!isEditing && nombre) {
      const slugGenerado = generarSlug(nombre)
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  // Resetear formulario cuando cambia open o marcaEditar
  useEffect(() => {
    if (!open) {
      setNombre('')
      setSlug('')
      setOrden(0)
      setEstado('activo')
      setLogoUrl('')
      setErrors({})
      return
    }

    if (open && marcaEditar) {
      setLogoUrl(marcaEditar.logo || '')
      setNombre(marcaEditar.nombre)
      setSlug(marcaEditar.slug)
      setOrden(marcaEditar.orden)
      setEstado(marcaEditar.estado === 'eliminado' ? 'activo' : marcaEditar.estado)
    } else if (open && !marcaEditar) {
      // Obtener el siguiente orden disponible automáticamente
      getNextOrdenMarca().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setNombre('')
      setSlug('')
      setLogoUrl('')
      setEstado('activo')
    }
  }, [open, marcaEditar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    if (!slug.trim()) {
      newErrors.slug = 'El slug es obligatorio'
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Solo minúsculas, números y guiones'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && marcaEditar) {
        await actualizarMarca({
          id: marcaEditar.id,
          nombre: nombre.trim(),
          slug: slug.trim(),
          logo: logoUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Marca actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearMarca({
          nombre: nombre.trim(),
          slug: slug.trim(),
          logo: logoUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Marca creada', 'La marca se registró exitosamente')
      }
      
      setNombre('')
      setSlug('')
      setOrden(0)
      setEstado('activo')
      setLogoUrl('')
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
    setOrden(0)
    setEstado('activo')
    setLogoUrl('')
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
      title={isEditing ? 'Editar Marca' : 'Nueva Marca'}
      description={isEditing ? 'Modifica la información de la marca' : 'Registra una nueva marca en el sistema'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Marca'}
    >
      <div className="space-y-6">
        {/* Upload de Logo */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            onRemove={() => setLogoUrl('')}
            bucket="marcas-logos"
            folder="logos"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'M'}
            label="Logo de la Marca"
          />
        </div>

        {/* Nombre y Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre de la Marca"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: SKF"
            error={errors.nombre}
            required
          />
          <FormField
            label="Slug (URL amigable)"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              if (errors.slug) setErrors({ ...errors, slug: '' })
            }}
            placeholder="skf"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'Identificador único en la URL' : 'Se genera automáticamente'}
          />
        </div>

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Orden de visualización"
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