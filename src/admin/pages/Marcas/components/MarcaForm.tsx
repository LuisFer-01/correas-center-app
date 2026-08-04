import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageCropModal } from '@/admin/components/shared/ImageCropModal'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMarca, crearMarca, generarSlug, getNextOrdenMarca } from '@/admin/services/marca.service'
import type { Marca } from '@/admin/types/marca'
import { Button } from '@/components/ui/button'
import { CropIcon, ImageIcon, Trash2 } from 'lucide-react'
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
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

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

  const handleImageChange = (newImageUrl: string) => {
    setLogoUrl(newImageUrl)
  }

  const handleRemoveImage = () => {
    setLogoUrl('')
  }

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <>
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
          {/* ✅ NUEVO: Sección de Logo con Crop */}
          <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 block">
              Logo de la Marca
            </label>
            
            <div className="flex items-start gap-4">
              {/* Preview de la imagen */}
              <div className="flex-shrink-0">
                {logoUrl ? (
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoUrl}
                        alt="Logo de la marca"
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    {/* Botón para eliminar imagen */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sin logo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCropModalOpen(true)}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  <CropIcon className="h-4 w-4 mr-2" />
                  {logoUrl ? 'Editar/Recortar logo' : 'Subir y recortar logo'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                  {logoUrl 
                    ? 'Haz clic para recortar o cambiar la imagen actual' 
                    : 'Selecciona una imagen desde tu dispositivo y recórtala'}
                </p>
              </div>
            </div>
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

      {/* ✅ NUEVO: Modal de Crop */}
      <ImageCropModal
        open={isCropModalOpen}
        onOpenChange={setIsCropModalOpen}
        currentImageUrl={logoUrl}
        bucket="marcas-logos"
        folder="logos"
        onImageChange={handleImageChange}
        label="Logo de la marca"
        maxSizeMB={2}
      />
    </>
  )
}