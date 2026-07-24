import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarMenu, crearMenu, getEmpresasActivas, getNextOrdenMenu, getNextRegistroId } from '@/admin/services/menu.service'
import type { Menu } from '@/admin/types/menu'
import { useEffect, useState } from 'react'

// ✅ NUEVO: Mapeo de tipo_registro a su prefijo de ruta
const tipoRegistroPrefijos: Record<string, string> = {
  producto: '/products/',
  industria: '/applications/',
  servicio: '/services/',
}

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
  const [suffix, setSuffix] = useState('') // ✅ NUEVO: Solo la parte final de la ruta
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

  // ✅ NUEVO: Actualizar registro_id automáticamente al cambiar tipo_registro (solo en creación)
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
      setSuffix('')
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
      setIcono(menuEditar.icono || '')
      setMostrar(menuEditar.mostrar)
      setOrden(menuEditar.orden)
      setEstado(menuEditar.estado === 'eliminado' ? 'activo' : menuEditar.estado)
      
      // ✅ NUEVO: Extraer el suffix de la ruta existente
      const prefijo = tipoRegistroPrefijos[menuEditar.tipo_registro] || ''
      const rutaCompleta = menuEditar.ruta || ''
      if (rutaCompleta.startsWith(prefijo)) {
        setSuffix(rutaCompleta.substring(prefijo.length).replace(/\/$/, ''))
      } else {
        setSuffix(rutaCompleta)
      }
    } else if (open && empresas.length > 0 && !menuEditar) {
      getNextOrdenMenu().then((nextOrden) => {
        setOrden(nextOrden)
      })
      setEmpresaId(empresas[0]?.id || 0)
      setGrupo('')
      setTipoRegistro('producto')
      setRegistroId(0)
      setSuffix('')
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
    if (!suffix.trim()) newErrors.suffix = 'La ruta es obligatoria'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // ✅ NUEVO: Construir la ruta final concatenada
      const prefijo = tipoRegistroPrefijos[tipoRegistro] || ''
      const cleanSuffix = suffix.replace(/^\//, '').replace(/\/$/, '').trim()
      const rutaFinal = `${prefijo}${cleanSuffix}/`

      if (isEditing && menuEditar) {
        await actualizarMenu({
          id: menuEditar.id,
          empresa_id: empresaId,
          grupo: grupo.trim(),
          tipo_registro: tipoRegistro,
          registro_id: registroId,
          ruta: rutaFinal,
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
          ruta: rutaFinal,
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
    setSuffix('')
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

  const prefijoActual = tipoRegistroPrefijos[tipoRegistro] || ''

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

        {/* Registro ID */}
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

        {/* ✅ NUEVO: Ruta con Prefijo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Ruta *
          </label>
          <div className="flex items-center gap-2">
            {/* Prefijo fijo (no editable) */}
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600">
              {prefijoActual}
            </span>
            {/* Input editable para el suffix */}
            <input
              type="text"
              value={suffix}
              onChange={(e) => {
                setSuffix(e.target.value)
                if (errors.suffix) setErrors({ ...errors, suffix: '' })
              }}
              placeholder="correas"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 outline-none"
            />
          </div>
          {errors.suffix && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.suffix}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Escribe solo la parte final de la ruta. Se concatenará automáticamente con el prefijo del tipo de registro.
            <br />
            <span className="font-mono text-[#EA0A2A]">
              Ejemplo final: {prefijoActual}{suffix || 'correas'}/
            </span>
          </p>
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
                <span className="text-[#EA0A2A] font-mono text-sm">{icono}</span>
              ) : (
                <span className="text-gray-400 text-sm">Sin icono seleccionado</span>
              )}
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