import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarConfiguracion, crearConfiguracion } from '@/admin/services/configuracion.service'
import type { ConfiguracionSitio, GrupoConfiguracion, TipoConfiguracion } from '@/admin/types/configuracion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

interface ConfiguracionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  configEditar?: ConfiguracionSitio | null
  onSuccess: () => void
}

const GRUPOS: { value: GrupoConfiguracion | string; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'seo', label: 'SEO' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'redes_sociales', label: 'Redes Sociales' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'chat', label: 'Chat (Tawk.to)' },
  { value: 'analytics', label: 'Analytics' },
]

const TIPOS: { value: TipoConfiguracion; label: string }[] = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'booleano', label: 'Booleano (Sí/No)' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'json', label: 'JSON' },
]

export function ConfiguracionForm({
  open,
  onOpenChange,
  configEditar,
  onSuccess,
}: ConfiguracionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [clave, setClave] = useState('')
  const [grupo, setGrupo] = useState<string>('general')
  const [tipo, setTipo] = useState<TipoConfiguracion>('texto')
  const [valor, setValor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activo, setActivo] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!configEditar

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setClave('')
      setGrupo('general')
      setTipo('texto')
      setValor('')
      setDescripcion('')
      setActivo(true)
      setErrors({})
      return
    }

    if (open && configEditar) {
      setClave(configEditar.clave)
      setGrupo(configEditar.grupo)
      setTipo(configEditar.tipo)
      setValor(configEditar.valor || '')
      setDescripcion(configEditar.descripcion || '')
      setActivo(configEditar.activo)
    } else if (open && !configEditar) {
      setClave('')
      setGrupo('general')
      setTipo('texto')
      setValor('')
      setDescripcion('')
      setActivo(true)
    }
  }, [open, configEditar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!clave.trim()) newErrors.clave = 'La clave es obligatoria'
    else if (!/^[a-z0-9_]+$/.test(clave)) newErrors.clave = 'Solo minúsculas, números y guiones bajos'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && configEditar) {
        await actualizarConfiguracion({
          id: configEditar.id,
          valor,
          descripcion: descripcion.trim() || undefined,
          activo,
        })
        toast.success('Configuración actualizada', 'Los cambios se guardaron correctamente')
      } else {
        await crearConfiguracion({
          empresa_id: 1,
          clave: clave.trim(),
          valor,
          tipo,
          descripcion: descripcion.trim() || undefined,
          grupo,
          activo,
        })
        toast.success('Configuración creada', 'El registro se agregó exitosamente')
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
    setClave('')
    setGrupo('general')
    setTipo('texto')
    setValor('')
    setDescripcion('')
    setActivo(true)
    setErrors({})
    onOpenChange(false)
  }

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Configuración' : 'Nueva Configuración'}
      description={
        isEditing
          ? 'Modifica el valor y la descripción de este parámetro'
          : 'Agrega un nuevo parámetro de configuración al sitio'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Registro'}
    >
      <div className="space-y-4">
        {/* Clave y Grupo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Clave (Identificador único)"
            name="clave"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value)
              if (errors.clave) setErrors({ ...errors, clave: '' })
            }}
            placeholder="ej: titulo_sitio"
            error={errors.clave}
            required
            disabled={isEditing}
            inputClassName="font-mono text-sm"
            helpText={isEditing ? 'No se puede modificar' : 'Formato snake_case'}
          />
          <SelectField
            label="Grupo"
            name="grupo"
            value={grupo}
            onValueChange={setGrupo}
            options={GRUPOS}
            disabled={isEditing}
          />
        </div>

        {/* Tipo y Descripción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de Dato"
            name="tipo"
            value={tipo}
            onValueChange={(val) => setTipo(val as TipoConfiguracion)}
            options={TIPOS}
            disabled={isEditing}
          />
          <FormField
            label="Descripción"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe para qué sirve este parámetro..."
          />
        </div>

        {/* Campo Valor Dinámico */}
        <div className="border-t pt-4 dark:border-gray-700">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
            Valor {tipo !== 'booleano' && <span className="text-red-500">*</span>}
          </Label>
          
          {tipo === 'texto' && (
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#EA0A2A] focus:ring-1 focus:ring-[#EA0A2A] outline-none"
              placeholder="Ingresa el valor de texto"
            />
          )}

          {tipo === 'numero' && (
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-[#EA0A2A] focus:ring-1 focus:ring-[#EA0A2A] outline-none"
              placeholder="0"
            />
          )}

          {tipo === 'booleano' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="valor-booleano"
                checked={valor === 'true'}
                onCheckedChange={(checked) => setValor(checked ? 'true' : 'false')}
              />
              <Label htmlFor="valor-booleano" className="cursor-pointer dark:text-gray-200">
                {valor === 'true' ? 'Activado (true)' : 'Desactivado (false)'}
              </Label>
            </div>
          )}

          {tipo === 'imagen' && (
            <ImageUpload
              value={valor}
              onChange={setValor}
              onRemove={() => setValor('')}
              bucket="configuracion"
              folder="settings"
              fallbackText="IMG"
              label="Subir Imagen"
              maxSizeMB={2}
            />
          )}

          {tipo === 'json' && (
            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:border-[#EA0A2A] focus:ring-1 focus:ring-[#EA0A2A] outline-none"
              placeholder='{"key": "value"}'
            />
          )}
        </div>

        {/* Estado Activo */}
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="activo"
            checked={activo}
            onCheckedChange={(checked) => setActivo(checked as boolean)}
          />
          <Label htmlFor="activo" className="cursor-pointer dark:text-gray-200">
            Registro activo (visible en el sitio)
          </Label>
        </div>
      </div>
    </FormShell>
  )
}