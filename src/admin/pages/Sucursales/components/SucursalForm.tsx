import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarSucursal, crearSucursal, getEmpresasActivas } from '@/admin/services/sucursal.service'
import type { Sucursal } from '@/admin/types/sucursal'
import { useEffect, useState } from 'react'

// Función auxiliar para extraer coordenadas del enlace de Google Maps
const extractCoordinatesFromMapUrl = (url: string) => {
  const latMatch = url.match(/!3d(-?\d+\.\d+)/)
  const lngMatch = url.match(/!2d(-?\d+\.\d+)/)
  if (latMatch && lngMatch) {
    return {
      latitud: parseFloat(latMatch[1]),
      longitud: parseFloat(lngMatch[1]),
    }
  }
  return null
}

interface SucursalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sucursalEditar?: Sucursal | null
  onSuccess: () => void
}

export function SucursalForm({
  open,
  onOpenChange,
  sucursalEditar,
  onSuccess,
}: SucursalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)

  const [formData, setFormData] = useState({
    empresa_id: 0,
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    horarios: '',
    mapa_incrustado: '',
    latitud: '',
    longitud: '',
    es_principal: false,
    orden: 0,
    estado: 'activo' as 'activo' | 'inactivo',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!sucursalEditar

  // Cargar empresas solo una vez cuando se abre el modal
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
  }, [open, empresasLoaded])

  // Resetear formulario cuando cambia open o sucursalEditar
  useEffect(() => {
    if (!open) {
      setFormData({
        empresa_id: 0,
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        horarios: '',
        mapa_incrustado: '',
        latitud: '',
        longitud: '',
        es_principal: false,
        orden: 0,
        estado: 'activo',
      })
      setErrors({})
      return
    }

    if (open && sucursalEditar) {
      setFormData({
        empresa_id: sucursalEditar.empresa_id,
        nombre: sucursalEditar.nombre,
        direccion: sucursalEditar.direccion,
        telefono: sucursalEditar.telefono,
        email: sucursalEditar.email || '',
        horarios: sucursalEditar.horarios || '',
        mapa_incrustado: sucursalEditar.mapa_incrustado || '',
        latitud: sucursalEditar.latitud?.toString() || '',
        longitud: sucursalEditar.longitud?.toString() || '',
        es_principal: sucursalEditar.es_principal,
        orden: sucursalEditar.orden,
        estado: sucursalEditar.estado === 'eliminado' ? 'activo' : sucursalEditar.estado,
      })
    } else if (open && empresas.length > 0 && !sucursalEditar) {
      setFormData({
        ...formData,
        empresa_id: empresas[0]?.id || 0,
      })
    }
  }, [open, sucursalEditar, empresas])

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleMapaChange = (value: string) => {
    setFormData({ ...formData, mapa_incrustado: value })
    // Intentar extraer coordenadas automáticamente
    const coords = extractCoordinatesFromMapUrl(value)
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        mapa_incrustado: value,
        latitud: coords.latitud.toString(),
        longitud: coords.longitud.toString(),
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.empresa_id) newErrors.empresa_id = 'Selecciona una empresa'
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    else if (formData.nombre.trim().length < 2) newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria'
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        empresa_id: formData.empresa_id,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim() || undefined,
        horarios: formData.horarios.trim() || undefined,
        mapa_incrustado: formData.mapa_incrustado.trim() || undefined,
        latitud: formData.latitud ? parseFloat(formData.latitud) : undefined,
        longitud: formData.longitud ? parseFloat(formData.longitud) : undefined,
        es_principal: formData.es_principal,
        orden: formData.orden,
        estado: formData.estado,
      }

      if (isEditing && sucursalEditar) {
        await actualizarSucursal({ id: sucursalEditar.id, ...payload })
        toast.success('Sucursal actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearSucursal(payload)
        toast.success('Sucursal creada', 'La sucursal se registró exitosamente')
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
    setFormData({
      empresa_id: 0,
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      horarios: '',
      mapa_incrustado: '',
      latitud: '',
      longitud: '',
      es_principal: false,
      orden: 0,
      estado: 'activo',
    })
    setErrors({})
    onOpenChange(false)
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
      title={isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
      description={isEditing ? 'Modifica los datos de la sucursal' : 'Registra una nueva sede o sucursal'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Sucursal'}
    >
      <div className="space-y-4">
        {/* Empresa */}
        <SelectField
          label="Empresa"
          name="empresa_id"
          value={formData.empresa_id.toString()}
          onValueChange={(val) => handleChange('empresa_id', Number(val))}
          options={empresasOptions}
          placeholder="Selecciona una empresa"
          error={errors.empresa_id}
          required
        />

        {/* Nombre y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre de la Sucursal"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Sede Central La Paz"
            error={errors.nombre}
            required
          />
          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="+591 2 2222222"
            error={errors.telefono}
            required
          />
        </div>

        {/* Dirección y Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            placeholder="Av. Principal #123"
            error={errors.direccion}
            required
          />
          <FormField
            label="Email de Contacto"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="sucursal@empresa.com"
            error={errors.email}
          />
        </div>

        {/* Coordenadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Latitud"
            name="latitud"
            type="number"
            value={formData.latitud}
            onChange={(e) => handleChange('latitud', e.target.value)}
            placeholder="-16.5000"
          />
          <FormField
            label="Longitud"
            name="longitud"
            type="number"
            value={formData.longitud}
            onChange={(e) => handleChange('longitud', e.target.value)}
            placeholder="-68.1193"
          />
        </div>

        {/* Horarios */}
        <FormField
          label="Horarios de Atención"
          name="horarios"
          value={formData.horarios}
          onChange={(e) => handleChange('horarios', e.target.value)}
          placeholder="Lun-Vie: 8:00 - 18:00, Sab: 8:00 - 13:00"
        />

        {/* Mapa Incrustado */}
        <FormField
          label="Mapa Incrustado (iframe de Google Maps)"
          name="mapa_incrustado"
          value={formData.mapa_incrustado}
          onChange={(e) => handleMapaChange(e.target.value)}
          placeholder="Pega aquí el enlace del iframe de Google Maps..."
          multiline
          rows={3}
          helpText="💡 Al pegar un enlace de Google Maps, la latitud y longitud se completarán automáticamente."
        />

        {/* Configuración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <CheckboxField
            label="Es Sede Principal"
            name="es_principal"
            checked={formData.es_principal}
            onCheckedChange={(checked) => handleChange('es_principal', checked)}
          />
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={formData.orden.toString()}
            onChange={(e) => handleChange('orden', Number(e.target.value))}
          />
          <SelectField
            label="Estado"
            name="estado"
            value={formData.estado}
            onValueChange={(val) => handleChange('estado', val)}
            options={estadoOptions}
          />
        </div>
      </div>
    </FormShell>
  )
}