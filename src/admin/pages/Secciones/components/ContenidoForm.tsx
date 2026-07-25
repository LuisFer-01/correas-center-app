import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarContenido, crearContenido, getEmpresasActivas, getNextOrdenContenido, getTiposSeccion } from '@/admin/services/contenido.service'
import type { ContenidoSeccion } from '@/admin/types/contenido'
import { useEffect, useState } from 'react'

// ✅ MAPEO DE CAMPOS METADATA POR TIPO DE SECCIÓN
const metadataFieldsByTipo: Record<number, string[]> = {
  1: ['badge_text', 'cta_primary_href', 'cta_primary_text', 'cta_secondary_href', 'cta_secondary_text'], // Hero
  2: ['subtitulo'], // Diferencial
  3: [], // Por qué elegirnos - No Aplica
  4: [], // Capacidad de infraestructura - No Aplica
  5: ['stats'], // Característica de infraestructura
}

// Etiquetas legibles para cada campo
const fieldLabels: Record<string, string> = {
  badge_text: 'Texto del Badge',
  cta_primary_href: 'Enlace Botón Primario',
  cta_primary_text: 'Texto Botón Primario',
  cta_secondary_href: 'Enlace Botón Secundario',
  cta_secondary_text: 'Texto Botón Secundario',
  subtitulo: 'Subtítulo',
  stats: 'Estadística / Texto destacado',
}

// Placeholders para cada campo
const fieldPlaceholders: Record<string, string> = {
  badge_text: 'Ej: Líder en Soluciones Industriales',
  cta_primary_href: 'Ej: /contact',
  cta_primary_text: 'Ej: Solicitar Asesoría',
  cta_secondary_href: 'Ej: /products',
  cta_secondary_text: 'Ej: Ver Productos',
  subtitulo: 'Ej: Experiencia Comprobada',
  stats: 'Ej: SKF Autorizado',
}

interface ContenidoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contenidoEditar?: ContenidoSeccion | null
  onSuccess: () => void
}

export function ContenidoForm({
  open,
  onOpenChange,
  contenidoEditar,
  onSuccess,
}: ContenidoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [tiposSeccion, setTiposSeccion] = useState<{ id: number; nombre: string; slug: string; campos_metadata?: string[] }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)
  const [tiposLoaded, setTiposLoaded] = useState(false)
  const [imagenUrl, setImagenUrl] = useState<string>('')

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [tipoSeccionId, setTipoSeccionId] = useState<number>(0)
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('')
  const [orden, setOrden] = useState(0)
  const [mostrar, setMostrar] = useState(true)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  
  // ✅ Metadata como objeto en lugar de string JSON
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!contenidoEditar
  
  // Obtener campos del tipo de sección seleccionado
  const camposMetadata = metadataFieldsByTipo[tipoSeccionId] || []
  const noAplica = tipoSeccionId === 3 || tipoSeccionId === 4

  // Cargar empresas y tipos de sección solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
    if (open && !tiposLoaded) {
      getTiposSeccion().then((data) => {
        setTiposSeccion(data)
        setTiposLoaded(true)
      })
    }
  }, [open, empresasLoaded, tiposLoaded])

  // ✅ Cuando cambia el tipo de sección, inicializar metadata con estructura vacía
  useEffect(() => {
    if (!tipoSeccionId) {
      setMetadata({})
      return
    }
    
    const campos = metadataFieldsByTipo[tipoSeccionId] || []
    
    // Si estamos editando y el tipo no cambia, preservar valores existentes
    if (isEditing && contenidoEditar && contenidoEditar.tipo_seccion_id === tipoSeccionId) {
      return
    }
    
    // Generar estructura vacía con las claves predefinidas
    const nuevaMetadata: Record<string, string> = {}
    campos.forEach((campo) => {
      nuevaMetadata[campo] = ''
    })
    setMetadata(nuevaMetadata)
  }, [tipoSeccionId, isEditing, contenidoEditar])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setTipoSeccionId(0)
      setTitulo('')
      setSubtitulo('')
      setDescripcion('')
      setIcono('')
      setOrden(0)
      setMostrar(true)
      setEstado('activo')
      setImagenUrl('')
      setMetadata({})
      setErrors({})
      return
    }

    if (open && contenidoEditar) {
      setEmpresaId(contenidoEditar.empresa_id)
      setTipoSeccionId(contenidoEditar.tipo_seccion_id)
      setTitulo(contenidoEditar.titulo || '')
      setSubtitulo(contenidoEditar.subtitulo || '')
      setDescripcion(contenidoEditar.descripcion || '')
      setIcono(contenidoEditar.icono || '')
      setOrden(contenidoEditar.orden)
      setMostrar(contenidoEditar.mostrar)
      setEstado(contenidoEditar.estado === 'eliminado' ? 'activo' : contenidoEditar.estado)
      setImagenUrl(contenidoEditar.imagen || '')
      
      // Cargar metadata existente en el formato de campos
      const campos = metadataFieldsByTipo[contenidoEditar.tipo_seccion_id] || []
      const metadataExistente: Record<string, string> = {}
      campos.forEach((campo) => {
        const valor = contenidoEditar.metadata?.[campo]
        metadataExistente[campo] = typeof valor === 'string' ? valor : ''
      })
      setMetadata(metadataExistente)
    } else if (open && empresas.length > 0 && tiposSeccion.length > 0 && !contenidoEditar) {
      const primerTipoId = tiposSeccion[0]?.id || 0
      getNextOrdenContenido(primerTipoId).then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setTipoSeccionId(primerTipoId)
      setTitulo('')
      setSubtitulo('')
      setDescripcion('')
      setIcono('')
      setMostrar(true)
      setEstado('activo')
      setImagenUrl('')
      // El metadata se inicializa por el useEffect de tipoSeccionId
    }
  }, [open, contenidoEditar, empresas, tiposSeccion])

  const handleMetadataChange = (campo: string, valor: string) => {
    setMetadata((prev) => ({ ...prev, [campo]: valor }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!tipoSeccionId) newErrors.tipo_seccion_id = 'Selecciona un tipo de sección'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Filtrar metadata para solo incluir campos con valor
      const metadataFiltrada: Record<string, string> = {}
      Object.entries(metadata).forEach(([key, value]) => {
        if (value.trim()) {
          metadataFiltrada[key] = value
        }
      })

      const payload = {
        empresa_id: empresaId,
        tipo_seccion_id: tipoSeccionId,
        titulo: titulo.trim() || undefined,
        subtitulo: subtitulo.trim() || undefined,
        descripcion: descripcion.trim() || undefined,
        icono: icono.trim() || undefined,
        imagen: imagenUrl,
        metadata: metadataFiltrada,
        orden,
        mostrar,
        estado,
      }

      if (isEditing && contenidoEditar) {
        await actualizarContenido({ id: contenidoEditar.id, ...payload })
        toast.success('Contenido actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearContenido(payload)
        toast.success('Contenido creado', 'El contenido se registró exitosamente')
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
    setTipoSeccionId(0)
    setTitulo('')
    setSubtitulo('')
    setDescripcion('')
    setIcono('')
    setOrden(0)
    setMostrar(true)
    setEstado('activo')
    setImagenUrl('')
    setMetadata({})
    setErrors({})
    onOpenChange(false)
  }

  const empresasOptions = empresas.map((emp) => ({
    value: emp.id.toString(),
    label: emp.nombre,
  }))

  const tiposOptions = tiposSeccion.map((tipo) => ({
    value: tipo.id.toString(),
    label: tipo.nombre,
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
      description={isEditing ? 'Modifica el contenido de la sección' : 'Agrega contenido a una sección del sitio'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Contenido'}
    >
      <div className="space-y-4">
        {/* Empresa y Tipo de Sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <SelectField
            label="Tipo de Sección"
            name="tipo_seccion_id"
            value={tipoSeccionId.toString()}
            onValueChange={(val) => setTipoSeccionId(Number(val))}
            options={tiposOptions}
            placeholder="Selecciona un tipo"
            error={errors.tipo_seccion_id}
            required
          />
        </div>

        {/* Upload de Imagen */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={imagenUrl}
            onChange={setImagenUrl}
            onRemove={() => setImagenUrl('')}
            bucket="secciones-imagenes"
            folder="secciones"
            fallbackText={titulo?.charAt(0).toUpperCase() || 'S'}
            label="Imagen de la Sección"
          />
        </div>

        {/* Título y Subtítulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Título"
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título principal"
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

        {/* Icono */}
        <FormField
          label="Icono"
          name="icono"
          value={icono}
          onChange={(e) => setIcono(e.target.value)}
          placeholder="Ej: fa-star, fa-check-circle"
          helpText="Nombre del icono de Font Awesome (opcional)"
        />

        {/* ✅ Campos de Metadata Dinámicos según Tipo de Sección */}
        <div className="border rounded-lg p-4 space-y-3 dark:border-gray-600 dark:bg-gray-800/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Campos Específicos ({tiposSeccion.find(t => t.id === tipoSeccionId)?.nombre || 'Ninguno'})
          </h4>
          
          {noAplica ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm font-medium">No Aplica</p>
              <p className="text-xs mt-1">Este tipo de sección no requiere campos adicionales</p>
            </div>
          ) : camposMetadata.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">Sin campos definidos para este tipo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {camposMetadata.map((campo) => (
                <FormField
                  key={campo}
                  label={fieldLabels[campo] || campo}
                  name={`metadata_${campo}`}
                  value={metadata[campo] || ''}
                  onChange={(e) => handleMetadataChange(campo, e.target.value)}
                  placeholder={fieldPlaceholders[campo] || `Valor de ${campo}`}
                  helpText={`Campo: ${campo}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mostrar, Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center pt-6">
            <CheckboxField
              label="Mostrar en sitio"
              name="mostrar"
              checked={mostrar}
              onCheckedChange={setMostrar}
            />
          </div>
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