import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarProducto, crearProducto, getEmpresasActivas, getMarcasActivas, getNextOrden } from '@/admin/services/producto.service'
import type { Producto } from '@/admin/types/producto'
import { useEffect, useState } from 'react'

interface ProductoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoEditar?: Producto | null
  onSuccess: () => void
}

export function ProductoForm({
  open,
  onOpenChange,
  productoEditar,
  onSuccess,
}: ProductoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: number; nombre: string; slug: string }[]>([])
  const [datosCargados, setDatosCargados] = useState(false)
  
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [empresaId, setEmpresaId] = useState<number>(0)
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [marcaIds, setMarcaIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!productoEditar

  // Cargar datos iniciales
  useEffect(() => {
    if (open && !datosCargados) {
      Promise.all([getEmpresasActivas(), getMarcasActivas()]).then(([empData, marcasData]) => {
        setEmpresas(empData)
        setMarcasDisponibles(marcasData)
        setDatosCargados(true)
      })
    }
  }, [open, datosCargados])

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
      setEmpresaId(0)
      setOrden(0)
      setEstado('activo')
      setMarcaIds([])
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
      setMarcaIds(productoEditar.marcas?.map((m) => m.id) || [])
    } else if (open && !productoEditar && empresas.length > 0) {
      getNextOrden().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setNombre('')
      setSlug('')
      setMarcaIds([])
      setImagenUrl('')
      setEstado('activo')
    }
  }, [open, productoEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    if (!slug.trim()) newErrors.slug = 'El slug es obligatorio'
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = 'Solo minúsculas, números y guiones'
    
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
          marca_ids: marcaIds,
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
          marca_ids: marcaIds,
        })
        toast.success('Producto creado', 'El producto se registró exitosamente')
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
    setEmpresaId(0)
    setOrden(0)
    setEstado('activo')
    setMarcaIds([])
    setImagenUrl('')
    setErrors({})
    onOpenChange(false)
  }

  const toggleMarca = (marcaId: number) => {
    setMarcaIds((prev) => 
      prev.includes(marcaId) 
        ? prev.filter((id) => id !== marcaId)
        : [...prev, marcaId]
    )
  }

  const empresasOptions = empresas.map((emp) => ({
    value: emp.id.toString(),
    label: emp.nombre,
  }))

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

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
        {/* Upload de Imagen */}
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

        {/* Empresa */}
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

        {/* Nombre y Slug */}
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

        {/* Marcas Asociadas */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Marcas Asociadas
          </label>
          <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800 max-h-40 overflow-y-auto">
            {marcasDisponibles.length > 0 ? (
              marcasDisponibles.map((marca) => (
                <CheckboxField
                  key={marca.id}
                  label={marca.nombre}
                  name={`marca-${marca.id}`}
                  checked={marcaIds.includes(marca.id)}
                  onCheckedChange={() => toggleMarca(marca.id)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay marcas activas disponibles.</p>
            )}
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