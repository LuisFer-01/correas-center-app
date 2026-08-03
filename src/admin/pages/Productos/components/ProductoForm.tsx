import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarProducto, crearProducto, getEmpresasActivas, getNextOrden } from '@/admin/services/producto.service'
import type { Producto } from '@/admin/types/producto'
import { useEffect, useState } from 'react'

interface ProductoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoEditar?: Producto | null
  onSuccess: () => void
}

export function ProductoForm({ open, onOpenChange, productoEditar, onSuccess }: ProductoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [datosCargados, setDatosCargados] = useState(false)
  
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [empresaId, setEmpresaId] = useState<number>(0)
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!productoEditar

  useEffect(() => {
    if (open && !datosCargados) {
      getEmpresasActivas().then((empData) => {
        setEmpresas(empData)
        setDatosCargados(true)
      })
    }
  }, [open, datosCargados])

  useEffect(() => {
    if (!isEditing && nombre) {
      const slugGenerado = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  useEffect(() => {
    if (!open) {
      setNombre('')
      setSlug('')
      setEmpresaId(0)
      setOrden(0)
      setEstado('activo')
      setImagenUrl('')
      setErrors({})
      return
    }

    if (open && productoEditar) {
      setImagenUrl(productoEditar.imagen || '')
      setNombre(productoEditar.nombre)
      setSlug(productoEditar.slug)
      setEmpresaId(productoEditar.empresa_id)
      setOrden(productoEditar.orden)
      setEstado(productoEditar.estado === 'eliminado' ? 'activo' : productoEditar.estado)
    } else if (open && !productoEditar && empresas.length > 0) {
      getNextOrden().then((nextOrden) => setOrden(nextOrden))
      setEmpresaId(empresas[0]?.id || 0)
      setNombre('')
      setSlug('')
      setImagenUrl('')
      setEstado('activo')
    }
  }, [open, productoEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!slug.trim()) newErrors.slug = 'El slug es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      if (isEditing && productoEditar) {
        await actualizarProducto({
          id: productoEditar.id,
          empresa_id: empresaId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Producto actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearProducto({
          empresa_id: empresaId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Producto creado', 'El producto se registró exitosamente')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error al guardar', error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setNombre('')
    setSlug('')
    setEmpresaId(0)
    setOrden(0)
    setEstado('activo')
    setImagenUrl('')
    setErrors({})
    onOpenChange(false)
  }

  const empresasOptions = empresas.map((emp) => ({ value: emp.id.toString(), label: emp.nombre }))
  const estadoOptions = [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      description={isEditing ? 'Modifica la información del producto' : 'Registra un nuevo producto en el catálogo'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Producto'}
    >
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={imagenUrl}
            onChange={setImagenUrl}
            onRemove={() => setImagenUrl('')}
            bucket="productos-imagenes"
            folder="productos"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'P'}
            label="Imagen del Producto"
          />
        </div>

        <SelectField
          label="Empresa"
          name="empresa_id"
          value={empresaId.toString()}
          onValueChange={(val) => setEmpresaId(Number(val))}
          options={empresasOptions}
          placeholder="Selecciona una empresa"
          error={errors.empresa_id}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre del Producto"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Correa en V A-50"
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
            placeholder="correa-en-v-a-50"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'Identificador único en la URL' : 'Se genera automáticamente'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Los productos se muestran en orden ascendente"
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