import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarCategoria, crearCategoria, getNextOrdenCategoria, getProductosActivos } from '@/admin/services/categoria.service'
import type { Categoria } from '@/admin/types/categoria'
import { useEffect, useState } from 'react'

interface CategoriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoriaEditar?: Categoria | null
  onSuccess: () => void
}

export function CategoriaForm({
  open,
  onOpenChange,
  categoriaEditar,
  onSuccess,
}: CategoriaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>([])
  const [productosLoaded, setProductosLoaded] = useState(false)
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [productoId, setProductoId] = useState<number>(0)
  const [descripcionCorta, setDescripcionCorta] = useState('')
  const [uso, setUso] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!categoriaEditar

  // Cargar productos solo una vez
  useEffect(() => {
    if (open && !productosLoaded) {
      getProductosActivos().then((data) => {
        setProductos(data)
        setProductosLoaded(true)
      })
    }
  }, [open, productosLoaded])

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
      setProductoId(0)
      setDescripcionCorta('')
      setUso('')
      setDescripcion('')
      setOrden(0)
      setEstado('activo')
      setImagenUrl('')
      setErrors({})
      return
    }

    if (open && categoriaEditar) {
      setImagenUrl(categoriaEditar.imagen || '')
      setNombre(categoriaEditar.nombre)
      setSlug(categoriaEditar.slug)
      setProductoId(categoriaEditar.producto_id)
      setDescripcionCorta(categoriaEditar.descripcion_corta || '')
      setUso(categoriaEditar.uso || '')
      setDescripcion(categoriaEditar.descripcion || '')
      setOrden(categoriaEditar.orden)
      setEstado(categoriaEditar.estado === 'eliminado' ? 'activo' : categoriaEditar.estado)
    } else if (open && productos.length > 0 && !categoriaEditar) {
      getNextOrdenCategoria().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setProductoId(productos[0]?.id || 0)
      setNombre('')
      setSlug('')
      setDescripcionCorta('')
      setUso('')
      setDescripcion('')
      setImagenUrl('')
      setEstado('activo')
    }
  }, [open, categoriaEditar, productos])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!productoId) newErrors.producto_id = 'Selecciona un producto'
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
      if (isEditing && categoriaEditar) {
        await actualizarCategoria({
          id: categoriaEditar.id,
          producto_id: productoId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion_corta: descripcionCorta.trim() || undefined,
          uso: uso.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Categoría actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearCategoria({
          producto_id: productoId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          descripcion_corta: descripcionCorta.trim() || undefined,
          uso: uso.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
        })
        toast.success('Categoría creada', 'La categoría se registró exitosamente')
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
    setProductoId(0)
    setDescripcionCorta('')
    setUso('')
    setDescripcion('')
    setOrden(0)
    setEstado('activo')
    setImagenUrl('')
    setErrors({})
    onOpenChange(false)
  }

  const productosOptions = productos.map((prod) => ({
    value: prod.id.toString(),
    label: prod.nombre,
  }))

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      description={isEditing ? 'Modifica la información de la categoría' : 'Registra una nueva categoría para un producto'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
    >
      <div className="space-y-6">
        {/* Upload de Imagen */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={imagenUrl}
            onChange={setImagenUrl}
            onRemove={() => setImagenUrl('')}
            bucket="categorias-imagenes"
            folder="categorias"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'C'}
            label="Imagen de la Categoría"
          />
        </div>

        {/* Producto */}
        <SelectField
          label="Producto Asociado"
          name="producto_id"
          value={productoId.toString()}
          onValueChange={(val) => setProductoId(Number(val))}
          options={productosOptions}
          placeholder="Selecciona un producto"
          error={errors.producto_id}
          required
        />

        {/* Nombre y Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre de la Categoría"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Correas en V"
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
            placeholder="correas-en-v"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'Identificador único en la URL' : 'Se genera automáticamente'}
          />
        </div>

        {/* Descripción Corta y Uso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Descripción Corta"
            name="descripcion_corta"
            value={descripcionCorta}
            onChange={(e) => setDescripcionCorta(e.target.value)}
            placeholder="Resumen breve"
          />
          <FormField
            label="Uso / Aplicación"
            name="uso"
            value={uso}
            onChange={(e) => setUso(e.target.value)}
            placeholder="Ej: Industrial, Automotriz"
          />
        </div>

        {/* Descripción Larga */}
        <FormField
          label="Descripción Completa"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción detallada de la categoría..."
          multiline
          rows={4}
        />

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
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