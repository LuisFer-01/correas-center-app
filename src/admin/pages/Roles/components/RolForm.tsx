import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarRol, crearRol, traducirGrupo } from '@/admin/services/rol.service'
import type { PermisosAgrupados, Rol } from '@/admin/types/rol'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useState } from 'react'

interface RolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permisosAgrupados: PermisosAgrupados
  rolEditar?: Rol | null
  onSuccess: () => void
}

export function RolForm({
  open,
  onOpenChange,
  permisosAgrupados,
  rolEditar,
  onSuccess,
}: RolFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [permisoIds, setPermisoIds] = useState<number[]>([]) // ✅ Ahora sí se usará
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!rolEditar

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

  // Cargar datos al editar
  useEffect(() => {
    if (rolEditar && open) {
      setNombre(rolEditar.nombre)
      setSlug(rolEditar.slug)
      setDescripcion(rolEditar.descripcion || '')
      setPermisoIds(rolEditar.permisos.map((p) => p.id))
    } else if (!open) {
      setNombre('')
      setSlug('')
      setDescripcion('')
      setPermisoIds([])
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
          permiso_ids: permisoIds,
        })
        toast.success('Rol actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearRol({
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim() || undefined,
          permiso_ids: permisoIds,
        })
        toast.success('Rol creado', 'El rol se registró exitosamente')
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
    setPermisoIds([])
    setErrors({})
    onOpenChange(false)
  }

  // ✅ FUNCIONES FALTANTES QUE USAN setPermisoIds
  const toggleGrupo = (grupo: string) => {
    const permisosDelGrupo = permisosAgrupados[grupo] || []
    const grupoIds = permisosDelGrupo.map((p) => p.id)
    const todosSeleccionados = grupoIds.every((id) => permisoIds.includes(id))
    
    if (todosSeleccionados) {
      setPermisoIds((prev) => prev.filter((id) => !grupoIds.includes(id)))
    } else {
      const nuevos = [...new Set([...permisoIds, ...grupoIds])]
      setPermisoIds(nuevos)
    }
  }

  const togglePermiso = (permisoId: number) => {
    setPermisoIds((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    )
  }

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
      description={
        isEditing
          ? 'Modifica la información y permisos del rol'
          : 'Define un nuevo rol con sus permisos de acceso'
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

        {/* Permisos agrupados */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Permisos del Rol
          </label>
          <ScrollArea className="h-[300px] rounded-md border border-gray-300 dark:border-gray-600 p-4 dark:bg-gray-800/50">
            <div className="space-y-4">
              {Object.entries(permisosAgrupados).map(([grupo, permisos]) => {
                const grupoIds = permisos.map((p) => p.id)
                const seleccionados = grupoIds.filter((id) => permisoIds.includes(id)).length
                const todosSeleccionados = seleccionados === grupoIds.length && grupoIds.length > 0

                return (
                  <div key={grupo} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                      <CheckboxField
                        label={traducirGrupo(grupo)}
                        name={`grupo-${grupo}`}
                        checked={todosSeleccionados}
                        onCheckedChange={() => toggleGrupo(grupo)}
                        description={`(${seleccionados}/${grupoIds.length})`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      {permisos.map((permiso) => (
                        <CheckboxField
                          key={permiso.id}
                          label={permiso.nombre}
                          name={`permiso-${permiso.id}`}
                          checked={permisoIds.includes(permiso.id)}
                          onCheckedChange={() => togglePermiso(permiso.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </FormShell>
  )
}