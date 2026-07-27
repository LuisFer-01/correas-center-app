import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarRol, crearRol } from '@/admin/services/rol.service'
import type { Rol } from '@/admin/types/rol'
import { useEffect, useState } from 'react'

interface RolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rolEditar?: Rol | null
  onSuccess: () => void
}

export function RolForm({
  open,
  onOpenChange,
  rolEditar,
  onSuccess,
}: RolFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!rolEditar

  // Auto-generar slug desde el nombre (solo en creación)
  useEffect(() => {
    if (!isEditing && nombre) {
      const slugGenerado = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  // Cargar datos al editar
  useEffect(() => {
    if (rolEditar && open) {
      setNombre(rolEditar.nombre)
      setSlug(rolEditar.slug)
      setDescripcion(rolEditar.descripcion || '')
    } else if (!open) {
      setNombre('')
      setSlug('')
      setDescripcion('')
      setErrors({})
    }
  }, [rolEditar, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!slug.trim()) newErrors.slug = 'El slug es obligatorio'
    else if (!/^[a-z0-9_-]+$/.test(slug)) newErrors.slug = 'Solo minúsculas, números, guiones y guiones bajos'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && rolEditar) {
        await actualizarRol({
          id: rolEditar.id,
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
        })
        toast.success('Rol actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearRol({
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          permiso_ids: [],
        })
        toast.success('Rol creado', 'El rol se registró exitosamente. Ahora puedes asignar permisos desde la tabla.')
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
    setErrors({})
    onOpenChange(false)
  }

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
      description={
        isEditing
          ? 'Modifica la información básica del rol'
          : 'Define un nuevo rol. Los permisos se asignan después desde la tabla.'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Rol'}
    >
      <div className="space-y-4">
        <FormField
          label="Nombre del Rol"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errors.nombre) setErrors({ ...errors, nombre: '' })
          }}
          placeholder="Ej: Administrador de Ventas"
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
          placeholder="admin_ventas"
          error={errors.slug}
          required
          inputClassName="font-mono text-sm"
          helpText="Identificador único en minúsculas (se genera automáticamente)"
        />

        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe las responsabilidades de este rol..."
          multiline
          rows={3}
        />

        {isEditing && rolEditar?.es_sistema && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota:</strong> Este es un rol del sistema. No puede ser eliminado, pero sí puedes modificar su nombre, slug y permisos.
            </p>
          </div>
        )}
      </div>
    </FormShell>
  )
}