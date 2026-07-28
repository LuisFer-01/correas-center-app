import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarPasoWizard, crearPasoWizard, getEmpresasActivas, getNextOrdenPasoWizard } from '@/admin/services/paso-wizard.service'
import type { PasoWizard } from '@/admin/types/pasos-wizard'
import { useEffect, useState } from 'react'

interface PasoWizardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pasoEditar?: PasoWizard | null
  onSuccess: () => void
}

export function PasoWizardForm({
  open,
  onOpenChange,
  pasoEditar,
  onSuccess,
}: PasoWizardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [identificador, setIdentificador] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fuenteDatos, setFuenteDatos] = useState('')
  const [campoFiltro, setCampoFiltro] = useState('')
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!pasoEditar

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
      setIdentificador('')
      setTitulo('')
      setDescripcion('')
      setFuenteDatos('')
      setCampoFiltro('')
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && pasoEditar) {
      setEmpresaId(pasoEditar.empresa_id)
      setIdentificador(pasoEditar.identificador)
      setTitulo(pasoEditar.titulo)
      setDescripcion(pasoEditar.descripcion)
      setFuenteDatos(pasoEditar.fuente_datos)
      setCampoFiltro(pasoEditar.campo_filtro || '')
      setOrden(pasoEditar.orden)
      setEstado(pasoEditar.estado === 'eliminado' ? 'activo' : pasoEditar.estado)
    } else if (open && empresas.length > 0 && !pasoEditar) {
      getNextOrdenPasoWizard().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setIdentificador('')
      setTitulo('')
      setDescripcion('')
      setFuenteDatos('')
      setCampoFiltro('')
      setEstado('activo')
    }
  }, [open, pasoEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!identificador.trim()) newErrors.identificador = 'El identificador es obligatorio'
    else if (!/^[a-z0-9_]+$/.test(identificador)) newErrors.identificador = 'Solo minúsculas, números y guiones bajos'
    if (!titulo.trim()) newErrors.titulo = 'El título es obligatorio'
    else if (titulo.trim().length < 2) newErrors.titulo = 'El título debe tener al menos 2 caracteres'
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria'
    else if (descripcion.trim().length < 5) newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres'
    if (!fuenteDatos) newErrors.fuente_datos = 'Selecciona la fuente de datos'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && pasoEditar) {
        await actualizarPasoWizard({
          id: pasoEditar.id,
          empresa_id: empresaId,
          identificador: identificador.trim(),
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fuente_datos: fuenteDatos,
          campo_filtro: campoFiltro.trim() || undefined,
          orden,
          estado,
        })
        toast.success('Paso actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearPasoWizard({
          empresa_id: empresaId,
          identificador: identificador.trim(),
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fuente_datos: fuenteDatos,
          campo_filtro: campoFiltro.trim() || undefined,
          orden,
          estado,
        })
        toast.success('Paso creado', 'El paso del wizard se registró exitosamente')
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
    setIdentificador('')
    setTitulo('')
    setDescripcion('')
    setFuenteDatos('')
    setCampoFiltro('')
    setOrden(0)
    setEstado('activo')
    setErrors({})
    onOpenChange(false)
  }

  const empresasOptions = empresas.map((emp) => ({
    value: emp.id.toString(),
    label: emp.nombre,
  }))

  const fuenteDatosOptions = [
    { value: 'productos', label: 'Productos' },
    { value: 'categorias', label: 'Categorías' },
    { value: 'industrias', label: 'Industrias' },
    { value: 'servicios', label: 'Servicios' },
  ]

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Paso del Wizard' : 'Nuevo Paso del Wizard'}
      description={
        isEditing
          ? 'Modifica la configuración del paso'
          : 'Configura un nuevo paso del asistente de selección'
      }
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Paso'}
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

        {/* Identificador y Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Identificador Único"
            name="identificador"
            value={identificador}
            onChange={(e) => {
              setIdentificador(e.target.value)
              if (errors.identificador) setErrors({ ...errors, identificador: '' })
            }}
            placeholder="Ej: selector_correas"
            error={errors.identificador}
            required
            inputClassName="font-mono text-sm"
            helpText="Clave única en formato snake_case"
          />
          <FormField
            label="Título del Paso"
            name="titulo"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value)
              if (errors.titulo) setErrors({ ...errors, titulo: '' })
            }}
            placeholder="Ej: Selecciona el tipo de correa"
            error={errors.titulo}
            required
          />
        </div>

        {/* Descripción */}
        <FormField
          label="Descripción"
          name="descripcion"
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value)
            if (errors.descripcion) setErrors({ ...errors, descripcion: '' })
          }}
          placeholder="Describe qué debe seleccionar el usuario en este paso..."
          multiline
          rows={3}
          error={errors.descripcion}
          required
        />

        {/* Fuente de Datos y Campo Filtro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Fuente de Datos"
            name="fuente_datos"
            value={fuenteDatos}
            onValueChange={(val) => setFuenteDatos(val)}
            options={fuenteDatosOptions}
            placeholder="Selecciona la tabla"
            error={errors.fuente_datos}
            required
          />
          <FormField
            label="Campo de Filtro"
            name="campo_filtro"
            value={campoFiltro}
            onChange={(e) => setCampoFiltro(e.target.value)}
            placeholder="Ej: empresa_id, categoria_id"
            inputClassName="font-mono text-sm"
            helpText="Campo usado para filtrar los datos (opcional)"
          />
        </div>

        {/* Orden y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
            helpText="Los pasos se muestran en orden ascendente"
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