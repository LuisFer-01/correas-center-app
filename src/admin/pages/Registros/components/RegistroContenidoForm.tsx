import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarRegistroContenido, crearRegistroContenido, getEmpresasActivas, getNextOrdenContenido } from '@/admin/services/registro.service'
import type { RegistroContenido } from '@/admin/types/registro'
import { useEffect, useState } from 'react'

interface RegistroContenidoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registroId: number
  contenidoEditar?: RegistroContenido | null
  onSuccess: () => void
}

export function RegistroContenidoForm({
  open,
  onOpenChange,
  registroId,
  contenidoEditar,
  onSuccess,
}: RegistroContenidoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('')
  const [stats, setStats] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!contenidoEditar

  // Cargar empresas solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
  }, [open, empresasLoaded])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setTitulo('')
      setSubtitulo('')
      setDescripcion('')
      setIcono('')
      setStats('')
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && contenidoEditar) {
      setEmpresaId(contenidoEditar.empresa_id)
      setTitulo(contenidoEditar.titulo || '')
      setSubtitulo(contenidoEditar.subtitulo || '')
      setDescripcion(contenidoEditar.descripcion || '')
      setIcono(contenidoEditar.icono || '')
      setStats(contenidoEditar.stats || '')
      setOrden(contenidoEditar.orden)
      setEstado(contenidoEditar.estado === 'eliminado' ? 'activo' : contenidoEditar.estado)
    } else if (open && empresas.length > 0 && !contenidoEditar) {
      getNextOrdenContenido(registroId).then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setTitulo('')
      setSubtitulo('')
      setDescripcion('')
      setIcono('')
      setStats('')
      setEstado('activo')
    }
  }, [open, contenidoEditar, empresas, registroId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        empresa_id: empresaId,
        registro_id: registroId,
        titulo: titulo.trim() || undefined,
        subtitulo: subtitulo.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        icono: icono.trim() || undefined,
        stats: stats.trim() || undefined,
        orden,
        estado,
      }

      if (isEditing && contenidoEditar) {
        await actualizarRegistroContenido({ id: contenidoEditar.id, ...payload })
        toast.success('Contenido actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearRegistroContenido(payload)
        toast.success('Contenido creado', 'El contenido se agregó exitosamente')
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
    setTitulo('')
    setSubtitulo('')
    setDescripcion('')
    setIcono('')
    setStats('')
    setOrden(0)
    setEstado('activo')
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
      title={isEditing ? 'Editar Contenido' : 'Nuevo Contenido'}
      description={isEditing ? 'Modifica el contenido de esta sección' : 'Agrega contenido a una sección del About'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Contenido'}
    >
      <div className="space-y-4">
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

        {/* Registro (pre-seleccionado y disabled) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Tipo de Sección
          </label>
          <div className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
            Registro #{registroId} (pre-seleccionado)
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Este campo está fijo para el registro seleccionado
          </p>
        </div>

        {/* Título y Subtítulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Título"
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título de la sección"
          />
          <FormField
            label="Subtítulo"
            name="subtitulo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            placeholder="Subtítulo"
          />
        </div>

        {/* Descripción */}
        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del contenido..."
          multiline
          rows={3}
        />

        {/* Icono y Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Icono (Lucide)"
            name="icono"
            value={icono}
            onChange={(e) => setIcono(e.target.value)}
            placeholder="Ej: CheckCircle2, Award"
            helpText="Nombre del icono de Lucide React"
          />
          <FormField
            label="Stats (texto destacado)"
            name="stats"
            value={stats}
            onChange={(e) => setStats(e.target.value)}
            placeholder="Ej: +25 Años"
          />
        </div>

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <FormField
            label="Orden"
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