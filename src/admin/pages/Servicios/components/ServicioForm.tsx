import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarServicio, crearServicio, getEmpresasActivas, getIndustriasActivas, getNextOrdenServicio } from '@/admin/services/servicio.service'
import type { Servicio } from '@/admin/types/servicio'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Factory } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ServicioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servicioEditar?: Servicio | null
  onSuccess: () => void
}

export function ServicioForm({
  open,
  onOpenChange,
  servicioEditar,
  onSuccess,
}: ServicioFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [industrias, setIndustrias] = useState<{ id: number; nombre: string; slug: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)
  const [industriasLoaded, setIndustriasLoaded] = useState(false)
  const [imagenUrl, setImagenUrl] = useState<string>('')
  const [industriasOpen, setIndustriasOpen] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [industriaIds, setIndustriaIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!servicioEditar

  // Cargar empresas e industrias solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
    if (open && !industriasLoaded) {
      getIndustriasActivas().then((data) => {
        setIndustrias(data)
        setIndustriasLoaded(true)
      })
    }
  }, [open, empresasLoaded, industriasLoaded])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setNombre('')
      setDescripcion('')
      setOrden(0)
      setEstado('activo')
      setIndustriaIds([])
      setImagenUrl('')
      setIndustriasOpen(false)
      setErrors({})
      return
    }

    if (open && servicioEditar) {
      setImagenUrl(servicioEditar.imagen || '')
      setEmpresaId(servicioEditar.empresa_id)
      setNombre(servicioEditar.nombre)
      setDescripcion(servicioEditar.descripcion || '')
      setOrden(servicioEditar.orden)
      setEstado(servicioEditar.estado === 'eliminado' ? 'activo' : servicioEditar.estado)
      const ids = servicioEditar.industrias_asignadas?.map(a => a.industria_id) || []
      setIndustriaIds(ids)
      setIndustriasOpen(ids.length > 0)
    } else if (open && empresas.length > 0 && !servicioEditar) {
      getNextOrdenServicio().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setNombre('')
      setDescripcion('')
      setIndustriaIds([])
      setImagenUrl('')
      setEstado('activo')
    }
  }, [open, servicioEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && servicioEditar) {
        await actualizarServicio({
          id: servicioEditar.id,
          empresa_id: empresaId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
          industria_ids: industriaIds,
        })
        toast.success('Servicio actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearServicio({
          empresa_id: empresaId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          imagen: imagenUrl,
          orden: orden,
          estado: estado,
          industria_ids: industriaIds,
        })
        toast.success('Servicio creado', 'El servicio se registró exitosamente')
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
    setDescripcion('')
    setOrden(0)
    setEstado('activo')
    setIndustriaIds([])
    setImagenUrl('')
    setIndustriasOpen(false)
    setErrors({})
    onOpenChange(false)
  }

  const toggleIndustria = (industriaId: number) => {
    setIndustriaIds((prev) =>
      prev.includes(industriaId)
        ? prev.filter((id) => id !== industriaId)
        : [...prev, industriaId]
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
      title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
      description={isEditing ? 'Modifica la información del servicio' : 'Registra un nuevo servicio para la empresa'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
    >
      <div className="space-y-6">
        {/* Upload de Imagen */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={imagenUrl}
            onChange={setImagenUrl}
            onRemove={() => setImagenUrl('')}
            bucket="servicios-imagenes"
            folder="servicios"
            fallbackIcon={<Factory className="h-8 w-8" />}
            label="Imagen del Servicio"
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

        {/* Nombre */}
        <FormField
          label="Nombre del Servicio"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errors.nombre) setErrors({ ...errors, nombre: '' })
          }}
          placeholder="Ej: Fabricación de Sellos SKF"
          error={errors.nombre}
          required
        />

        {/* Descripción */}
        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el servicio..."
          multiline
          rows={4}
        />

        {/* Industrias Asignadas - Collapsible */}
        <div className="space-y-2">
          <Collapsible open={industriasOpen} onOpenChange={setIndustriasOpen} className="border border-gray-300 dark:border-gray-600 rounded-lg">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Industrias Asignadas ({industriaIds.length})
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${industriasOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {industrias.length > 0 ? (
                  industrias.map((industria) => (
                    <CheckboxField
                      key={industria.id}
                      label={industria.nombre}
                      name={`industria-${industria.id}`}
                      checked={industriaIds.includes(industria.id)}
                      onCheckedChange={() => toggleIndustria(industria.id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No hay industrias disponibles
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