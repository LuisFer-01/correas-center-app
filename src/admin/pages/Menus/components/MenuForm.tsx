import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMenu, crearMenu, getEmpresasActivas, getNextOrdenMenu, getNextRegistroId } from '@/admin/services/menu.service'
import type { Menu } from '@/admin/types/menu'
import Icon from '@/components/Icon'
import { useEffect, useState } from 'react'

interface MenuFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuEditar?: Menu | null
  onSuccess: () => void
}

export function MenuForm({
  open,
  onOpenChange,
  menuEditar,
  onSuccess,
}: MenuFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [empresas, setEmpresas] = useState<{ id: number; nombre: string }[]>([])
  const [empresasLoaded, setEmpresasLoaded] = useState(false)

  const [empresaId, setEmpresaId] = useState<number>(0)
  const [grupo, setGrupo] = useState('')
  const [tipoRegistro, setTipoRegistro] = useState<'producto' | 'industria' | 'servicio'>('producto')
  const [registroId, setRegistroId] = useState<number>(0)
  const [ruta, setRuta] = useState('')
  const [icono, setIcono] = useState('')
  const [mostrar, setMostrar] = useState(true)
  const [orden, setOrden] = useState(0)
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!menuEditar

  // Cargar empresas solo una vez
  useEffect(() => {
    if (open && !empresasLoaded) {
      getEmpresasActivas().then((data) => {
        setEmpresas(data)
        setEmpresasLoaded(true)
      })
    }
  }, [open, empresasLoaded])

  // NUEVO: Actualizar registro_id automáticamente al cambiar tipo_registro (solo en creación)
  useEffect(() => {
    if (!isEditing && tipoRegistro) {
      getNextRegistroId(tipoRegistro).then((nextId) => {
        setRegistroId(nextId)
      })
    }
  }, [tipoRegistro, isEditing])

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setEmpresaId(0)
      setGrupo('')
      setTipoRegistro('producto')
      setRegistroId(0)
      setRuta('')
      setIcono('')
      setMostrar(true)
      setOrden(0)
      setEstado('activo')
      setErrors({})
      return
    }

    if (open && menuEditar) {
      setEmpresaId(menuEditar.empresa_id)
      setGrupo(menuEditar.grupo)
      setTipoRegistro(menuEditar.tipo_registro)
      setRegistroId(menuEditar.registro_id)
      setRuta(menuEditar.ruta)
      setIcono(menuEditar.icono || '')
      setMostrar(menuEditar.mostrar)
      setOrden(menuEditar.orden)
      setEstado(menuEditar.estado === 'eliminado' ? 'activo' : menuEditar.estado)
    } else if (open && empresas.length > 0 && !menuEditar) {
      getNextOrdenMenu().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setGrupo('')
      setTipoRegistro('producto')
      setRegistroId(0) // Se actualizará por el useEffect de tipoRegistro
      setRuta('')
      setIcono('')
      setMostrar(true)
      setEstado('activo')
    }
  }, [open, menuEditar, empresas])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!empresaId) newErrors.empresa_id = 'Selecciona una empresa'
    if (!grupo.trim()) newErrors.grupo = 'El nombre del grupo es obligatorio'
    if (!registroId) newErrors.registro_id = 'El ID del registro es obligatorio'
    if (!ruta.trim()) newErrors.ruta = 'La ruta es obligatoria'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && menuEditar) {
        await actualizarMenu({
          id: menuEditar.id,
          empresa_id: empresaId,
          grupo: grupo.trim(),
          tipo_registro: tipoRegistro,
          registro_id: registroId,
          ruta: ruta.trim(),
          icono: icono.trim() || undefined,
          mostrar,
          orden,
          estado,
        })
        toast.success('Menú actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearMenu({
          empresa_id: empresaId,
          grupo: grupo.trim(),
          tipo_registro: tipoRegistro,
          registro_id: registroId,
          ruta: ruta.trim(),
          icono: icono.trim() || undefined,
          mostrar,
          orden,
          estado,
        })
        toast.success('Menú creado', 'El menú se registró exitosamente')
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
    setGrupo('')
    setTipoRegistro('producto')
    setRegistroId(0)
    setRuta('')
    setIcono('')
    setMostrar(true)
    setOrden(0)
    setEstado('activo')
    setErrors({})
    onOpenChange(false)
  }

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
      title={isEditing ? 'Editar Menú' : 'Nuevo Menú'}
      description={isEditing ? 'Modifica la configuración del menú principal' : 'Registra un nuevo menú principal para la navegación'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Menú'}
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

        {/* Grupo y Tipo de Registro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre del Grupo"
            name="grupo"
            value={grupo}
            onChange={(e) => {
              setGrupo(e.target.value)
              if (errors.grupo) setErrors({ ...errors, grupo: '' })
            }}
            placeholder="Ej: Producto, Aplicacion"
            error={errors.grupo}
            required
          />
          <SelectField
            label="Tipo de Registro"
            name="tipo_registro"
            value={tipoRegistro}
            onValueChange={(val) => setTipoRegistro(val as 'producto' | 'industria' | 'servicio')}
            options={tipoRegistroOptions}
            required
          />
        </div>

        {/* Registro ID y Ruta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="ID del Registro"
            name="registro_id"
            type="number"
            value={registroId.toString()}
            onChange={(e) => {
              setRegistroId(Number(e.target.value))
              if (errors.registro_id) setErrors({ ...errors, registro_id: '' })
            }}
            placeholder="Ej: 1"
            error={errors.registro_id}
            required
            helpText="Se autocompleta según el tipo de registro seleccionado"
          />
          <FormField
            label="Ruta"
            name="ruta"
            value={ruta}
            onChange={(e) => {
              setRuta(e.target.value)
              if (errors.ruta) setErrors({ ...errors, ruta: '' })
            }}
            placeholder="Ej: /products/correas"
            error={errors.ruta}
            required
            helpText="La URL a la que redirigirá este menú"
          />
        </div>

        {/* Icono con Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Icono (Font Awesome)"
            name="icono"
            value={icono}
            onChange={(e) => setIcono(e.target.value)}
            placeholder="Ej: fa-box, fa-industry, fa-wrench"
            helpText="Nombre del icono de Font Awesome (opcional)"
          />
          <div className="flex flex-col justify-end pb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Vista previa</span>
            <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              {icono ? (
                <Icon name={icono} size="2x" className="text-[#EA0A2A]" />
              ) : (
                <Icon name="fa-circle" size="2x" className="text-gray-400" />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {icono || 'Sin icono seleccionado'}
              </span>
            </div>
          </div>
        </div>

        {/* Mostrar y Orden */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
          <CheckboxField
            label="Mostrar en navegación"
            name="mostrar"
            checked={mostrar}
            onCheckedChange={setMostrar}
          />
          <FormField
            label="Orden de visualización"
            name="orden"
            type="number"
            value={orden.toString()}
            onChange={(e) => setOrden(Number(e.target.value))}
          />
        </div>

        {/* Estado */}
        <SelectField
          label="Estado"
          name="estado"
          value={estado}
          onValueChange={(val) => setEstado(val as 'activo' | 'inactivo')}
          options={estadoOptions}
        />
      </div>
    </FormShell>
  )
}