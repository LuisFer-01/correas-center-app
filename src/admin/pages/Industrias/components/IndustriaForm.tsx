import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarIndustria, crearIndustria, generarSlug, getCategoriasActivas, getEmpresasActivas, getNextOrdenIndustria, getServiciosActivos } from '@/admin/services/industria.service'
import type { Industria } from '@/admin/types/industria'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Package, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'

interface IndustriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  industriaEditar?: Industria | null
  onSuccess: () => void
}

export function IndustriaForm({
  open,
  onOpenChange,
  industriaEditar,
  onSuccess,
}: IndustriaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [categorias, setCategorias] = useState<{ id: number; nombre: string; slug: string }[]>([])
  const [servicios, setServicios] = useState<{ id: number; nombre: string; descripcion?: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)
  const [categoriasLoaded, setCategoriasLoaded] = useState(false)
  const [serviciosLoaded, setServiciosLoaded] = useState(false)
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [categoriasOpen, setCategoriasOpen] = useState(false)
  const [serviciosOpen, setServiciosOpen] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [categoriaIds, setCategoriaIds] = useState<number[]>([])
  const [servicioIds, setServicioIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!industriaEditar

  // Cargar datos dependientes solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
    if (open && !categoriasLoaded) {
      getCategoriasActivas().then((data) => {
        setCategorias(data)
        setCategoriasLoaded(true)
      })
    }
    if (open && !serviciosLoaded) {
      getServiciosActivos().then((data) => {
        setServicios(data)
        setServiciosLoaded(true)
      })
    }
  }, [open, empresasLoaded, categoriasLoaded, serviciosLoaded])

  // Auto-generar slug desde el nombre (solo en creación)
  useEffect(() => {
    if (!isEditing && nombre) {
      const slugGenerado = generarSlug(nombre)
      setSlug(slugGenerado)
    }
  }, [nombre, isEditing])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setNombre('')
      setSlug('')
      setOrden(0)
      setEstado('activo')
      setCategoriaIds([])
      setServicioIds([])
      setImagenUrl('')
      setCategoriasOpen(false)
      setServiciosOpen(false)
      setErrors({})
      return
    }

    if (open && industriaEditar) {
      setImagenUrl(industriaEditar.imagen || '')
      setEmpresaId(industriaEditar.empresa_id)
      setNombre(industriaEditar.nombre)
      setSlug(industriaEditar.slug)
      setOrden(industriaEditar.orden)
      setEstado(industriaEditar.estado === 'eliminado' ? 'activo' : industriaEditar.estado)
      
      // Extraer IDs de categorías y servicios de las asignaciones
      const catIds = industriaEditar.asignaciones
        ?.filter(a => a.tipo_registro === 'categoria')
        .map(a => a.registro_id) || []
      const servIds = industriaEditar.asignaciones
        ?.filter(a => a.tipo_registro === 'servicio')
        .map(a => a.registro_id) || []
      
      setCategoriaIds(catIds)
      setServicioIds(servIds)
      setCategoriasOpen(catIds.length > 0)
      setServiciosOpen(servIds.length > 0)
    } else if (open && empresas.length > 0 && !industriaEditar) {
      getNextOrdenIndustria().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setNombre('')
      setSlug('')
      setCategoriaIds([])
      setServicioIds([])
      setImagenUrl('')
      setEstado('activo')
    }
  }, [open, industriaEditar, empresas])

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
      if (isEditing && industriaEditar) {
        await actualizarIndustria({
          id: industriaEditar.id,
          empresa_id: empresaId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
          categoria_ids: categoriaIds,
          servicio_ids: servicioIds,
        })
        toast.success('Industria actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearIndustria({
          empresa_id: empresaId,
          nombre: nombre.trim(),
          slug: slug.trim(),
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
          categoria_ids: categoriaIds,
          servicio_ids: servicioIds,
        })
        toast.success('Industria creada', 'La industria se registró exitosamente')
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
    setEmpresaId(0)
    setNombre('')
    setSlug('')
    setOrden(0)
    setEstado('activo')
    setCategoriaIds([])
    setServicioIds([])
    setImagenUrl('')
    setCategoriasOpen(false)
    setServiciosOpen(false)
    setErrors({})
    onOpenChange(false)
  }

  const toggleCategoria = (categoriaId: number) => {
    setCategoriaIds((prev) =>
      prev.includes(categoriaId)
        ? prev.filter((id) => id !== categoriaId)
        : [...prev, categoriaId]
    )
  }

  const toggleServicio = (servicioId: number) => {
    setServicioIds((prev) =>
      prev.includes(servicioId)
        ? prev.filter((id) => id !== servicioId)
        : [...prev, servicioId]
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
      title={isEditing ? 'Editar Industria/Aplicación' : 'Nueva Industria/Aplicación'}
      description={isEditing ? 'Modifica la información de la industria o aplicación' : 'Registra una nueva industria o campo de aplicación'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Industria'}
    >
      <div className="space-y-6">
        {/* Upload de Imagen */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={imagenUrl}
            onChange={setImagenUrl}
            onRemove={() => setImagenUrl('')}
            bucket="industrias-imagenes"
            folder="industrias"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'I'}
            label="Imagen de la Industria"
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
            label="Nombre de la Industria"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Minería"
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
            placeholder="mineria"
            error={errors.slug}
            required
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'Identificador único en la URL' : 'Se genera automáticamente'}
          />
        </div>

        {/* Sección de Categorías - Expandible */}
        <div className="space-y-2">
          <Collapsible open={categoriasOpen} onOpenChange={setCategoriasOpen} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Categorías Asignadas ({categoriaIds.length})
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${categoriasOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categorias.length > 0 ? (
                  categorias.map((categoria) => (
                    <CheckboxField
                      key={categoria.id}
                      label={categoria.nombre}
                      name={`categoria-${categoria.id}`}
                      checked={categoriaIds.includes(categoria.id)}
                      onCheckedChange={() => toggleCategoria(categoria.id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No hay categorías disponibles
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sección de Servicios - Expandible */}
        <div className="space-y-2">
          <Collapsible open={serviciosOpen} onOpenChange={setServiciosOpen} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Servicios Asignados ({servicioIds.length})
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${serviciosOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {servicios.length > 0 ? (
                  servicios.map((servicio) => (
                    <div key={servicio.id} className="space-y-1">
                      <CheckboxField
                        label={servicio.nombre}
                        name={`servicio-${servicio.id}`}
                        checked={servicioIds.includes(servicio.id)}
                        onCheckedChange={() => toggleServicio(servicio.id)}
                      />
                      {servicio.descripcion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                          {servicio.descripcion}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No hay servicios disponibles
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

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