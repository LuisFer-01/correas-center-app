import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarEmpresa, crearEmpresa } from '@/admin/services/empresa.service'
import type { Empresa } from '@/admin/types/empresa'
import { useEffect, useState } from 'react'

interface EmpresaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaEditar?: Empresa | null
  onSuccess: () => void
}

export function EmpresaForm({
  open,
  onOpenChange,
  empresaEditar,
  onSuccess,
}: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!empresaEditar

  useEffect(() => {
    if (empresaEditar && open) {
      setLogoUrl(empresaEditar.logo || '')
      setNombre(empresaEditar.nombre)
      setEstado(empresaEditar.estado === 'eliminado' ? 'activo' : empresaEditar.estado)
    } else if (!open) {
      setNombre('')
      setEstado('activo')
      setLogoUrl('')
      setErrors({})
    }
  }, [empresaEditar, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && empresaEditar) {
        await actualizarEmpresa({
          id: empresaEditar.id,
          nombre: nombre.trim(),
          logo: logoUrl,
          estado: estado,
        })
        toast.success('Empresa actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearEmpresa({
          nombre: nombre.trim(),
          logo: logoUrl,
          estado: estado,
        })
        toast.success('Empresa creada', 'La empresa se registró exitosamente')
      }
      
      setNombre('')
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
    setEstado('activo')
    setLogoUrl('')
    setErrors({})
    onOpenChange(false)
  }

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Empresa' : 'Crear Nueva Empresa'}
      description={
        isEditing
          ? 'Modifica la información de la empresa'
          : 'Registra una nueva empresa en el sistema'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Empresa'}
    >
      <div className="space-y-6">
        {/* Upload de Logo */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={logoUrl}
            onChange={setLogoUrl}
            onRemove={() => setLogoUrl('')}
            bucket="logos-empresas"
            folder="logos"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'E'}
            label="Logo de la Empresa"
          />
        </div>

        {/* Nombre */}
        <FormField
          label="Nombre de la Empresa"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errors.nombre) setErrors({ ...errors, nombre: '' })
          }}
          placeholder="Ej: Correas Center S.A."
          error={errors.nombre}
          required
        />

        {/* Estado */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Estado</p>
          <div className="flex gap-6">
            <CheckboxField
              label="Activo"
              name="estado-activo"
              checked={estado === 'activo'}
              onCheckedChange={(checked) => {
                if (checked) setEstado('activo')
              }}
            />
            <CheckboxField
              label="Inactivo"
              name="estado-inactivo"
              checked={estado === 'inactivo'}
              onCheckedChange={(checked) => {
                if (checked) setEstado('inactivo')
              }}
            />
          </div>
        </div>
      </div>
    </FormShell>
  )
}