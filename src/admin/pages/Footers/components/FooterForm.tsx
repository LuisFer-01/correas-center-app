import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarFooter, crearFooter, getEmpresasActivas, getNextOrdenFooter, getNextRegistroId } from '@/admin/services/footer.service'
import type { Footer } from '@/admin/types/footer'
import { useEffect, useState } from 'react'

interface FooterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  footerEditar?: Footer | null
  onSuccess: () => void
}

export function FooterForm({
  open,
  onOpenChange,
  footerEditar,
  onSuccess,
}: FooterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [tipo, setTipo] = useState<'producto' | 'industria' | 'servicio' | 'red_social'>('producto')
  const [tipoRegistro, setTipoRegistro] = useState<'producto' | 'industria' | 'servicio' | null>(null)
  const [registroId, setRegistroId] = useState<number | null>(null)
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [icono, setIcono] = useState('')
  const [orden, setOrden] = useState(0)
  const [mostrar, setMostrar] = useState(true)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!footerEditar
  const esRedSocial = tipo === 'red_social'

  // Cargar empresas solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
  }, [open, empresasLoaded])

  // Lógica condicional: Auto-completar registro_id y orden
  useEffect(() => {
    if (isEditing) return

    if (esRedSocial) {
      setTipoRegistro(null)
      setRegistroId(null)
      getNextOrdenFooter('red_social').then((nextOrden) => setOrden(nextOrden))
    } else {
      getNextOrdenFooter(tipo).then((nextOrden) => setOrden(nextOrden))
      
      if (tipoRegistro) {
        getNextRegistroId(tipoRegistro).then((nextId) => setRegistroId(nextId))
      } else {
        setRegistroId(null)
      }
    }
  }, [tipo, tipoRegistro, isEditing])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setTipo('producto')
      setTipoRegistro(null)
      setRegistroId(null)
      setTitulo('')
      setUrl('')
      setIcono('')
      setOrden(0)
      setMostrar(true)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && footerEditar) {
      setEmpresaId(footerEditar.empresa_id)
      setTipo(footerEditar.tipo)
      setTipoRegistro(footerEditar.tipo_registro || null)
      setRegistroId(footerEditar.registro_id || null)
      setTitulo(footerEditar.titulo || '')
      setUrl(footerEditar.url || '')
      setIcono(footerEditar.icono || '')
      setOrden(footerEditar.orden)
      setMostrar(footerEditar.mostrar)
      setEstado(footerEditar.estado === 'eliminado' ? 'activo' : footerEditar.estado)
    } else if (open && empresas.length > 0 && !footerEditar) {
      setEmpresaId(empresas[0]?.id || 0)
      setTipo('producto')
      setTipoRegistro('producto')
      setRegistroId(1)
      setTitulo('')
      setUrl('')
      setIcono('')
      setMostrar(true)
      setEstado('activo')
    }
  }, [open, footerEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!esRedSocial && !tipoRegistro) newErrors.tipo_registro = 'Selecciona un tipo de registro'
    if (!esRedSocial && !registroId) newErrors.registro_id = 'El ID del registro es obligatorio'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = {
        empresa_id: empresaId,
        tipo,
        tipo_registro: esRedSocial ? null : tipoRegistro,
        registro_id: esRedSocial ? null : registroId,
        titulo: titulo.trim() || undefined,
        url: url.trim() || undefined,
        icono: icono.trim() || undefined,
        orden,
        mostrar,
        estado,
      }

      if (isEditing && footerEditar) {
        await actualizarFooter({ id: footerEditar.id, ...payload })
        toast.success('Footer actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearFooter(payload)
        toast.success('Footer creado', 'El elemento se agregó al footer exitosamente')
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
    setTipo('producto')
    setTipoRegistro(null)
    setRegistroId(null)
    setTitulo('')
    setUrl('')
    setIcono('')
    setOrden(0)
    setMostrar(true)
    setEstado('activo')
    setErrors({})
    onOpenChange(false)
  }

  const tipoOptions = [
    { value: 'producto', label: 'Producto' },
    { value: 'industria', label: 'Industria' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'red_social', label: 'Red Social' },
  ]

  const tipoRegistroOptions = [
    { value: 'producto', label: 'Producto' },
    { value: 'industria', label: 'Industria' },
    { value: 'servicio', label: 'Servicio' },
  ]

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Footer' : 'Nuevo Footer'}
      description={isEditing ? 'Modifica el elemento del footer' : 'Agrega un nuevo elemento al footer del sitio'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Footer'}
    >
      <div className="space-y-4">
        {/* Empresa */}
        <SelectField
          label="Empresa"
          name="empresa_id"
          value={empresaId.toString()}
          onValueChange={(val) => setEmpresaId(Number(val))}
          options={empresas.map(e => ({ value: e.id.toString(), label: e.nombre }))}
          placeholder="Selecciona una empresa"
          error={errors.empresa_id}
          required
        />

        {/* Tipo y Tipo de Registro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Tipo"
            name="tipo"
            value={tipo}
            onValueChange={(val) => setTipo(val as any)}
            options={tipoOptions}
            required
          />
          <SelectField
            label="Tipo de Registro"
            name="tipo_registro"
            value={tipoRegistro || ''}
            onValueChange={(val) => setTipoRegistro(val as any)}
            options={tipoRegistroOptions}
            placeholder={esRedSocial ? 'No aplica' : 'Selecciona un tipo'}
            disabled={esRedSocial}
            error={errors.tipo_registro}
            required={!esRedSocial}
            helpText={esRedSocial ? 'No disponible para redes sociales' : 'Se autocompleta según el tipo'}
          />
        </div>

        {/* Registro ID y Orden */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="ID del Registro"
            name="registro_id"
            type="number"
            value={registroId?.toString() || ''}
            onChange={(e) => setRegistroId(Number(e.target.value))}
            placeholder="Ej: 1"
            disabled={esRedSocial}
            error={errors.registro_id}
            required={!esRedSocial}
            helpText={esRedSocial ? 'No aplica' : 'Se autocompleta con el siguiente disponible'}
          />
          <FormField
            label="Orden"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Se autocompleta con el siguiente disponible según el tipo"
          />
        </div>

        {/* Título y URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Título"
            name="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Facebook, SKF, Minería"
          />
          <FormField
            label="URL"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Icono */}
        <FormField
          label="Icono"
          name="icono"
          value={icono}
          onChange={(e) => setIcono(e.target.value)}
          placeholder={esRedSocial ? "Ej: fa-facebook-f, fa-instagram" : "Ej: fa-box, fa-industry"}
          helpText="Nombre del icono (Font Awesome o Lucide según configuración)"
        />

        {/* Mostrar y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <CheckboxField
            label="Mostrar en footer"
            name="mostrar"
            checked={mostrar}
            onCheckedChange={setMostrar}
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