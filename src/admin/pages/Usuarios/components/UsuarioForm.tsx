import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarUsuario, crearUsuario } from '@/admin/services/usuario.service'
import type { Role, UserProfile } from '@/admin/types/usuario'
import { useEffect, useState } from 'react'

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rolesDisponibles: Role[]
  usuarioEditar?: UserProfile | null
  onSuccess: () => void
}

export function UsuarioForm({
  open,
  onOpenChange,
  rolesDisponibles,
  usuarioEditar,
  onSuccess,
}: UsuarioFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!usuarioEditar

  // Resetear o llenar formulario
  useEffect(() => {
    if (!open) {
      setNombre('')
      setEmail('')
      setPassword('')
      setTelefono('')
      setEstado('activo')
      setRoleIds([])
      setAvatarUrl('')
      setErrors({})
      return
    }

    if (open && usuarioEditar) {
      setNombre(usuarioEditar.nombre_completo === 'Sin Nombre' ? '' : usuarioEditar.nombre_completo)
      setEmail(usuarioEditar.email === 'Sin email' ? '' : usuarioEditar.email)
      setTelefono(usuarioEditar.telefono || '')
      setEstado(usuarioEditar.estado === 'eliminado' ? 'activo' : usuarioEditar.estado)
      setRoleIds(usuarioEditar.roles.map((r) => r.id))
      setAvatarUrl(usuarioEditar.avatar_url || '')
      setPassword('') // No mostrar contraseña en edición
    } else if (open && !usuarioEditar) {
      setNombre('')
      setEmail('')
      setPassword('')
      setTelefono('')
      setEstado('activo')
      setRoleIds([])
      setAvatarUrl('')
    }
  }, [open, usuarioEditar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!email.trim()) newErrors.email = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido'
    
    if (!isEditing) {
      if (!password.trim()) newErrors.password = 'La contraseña es obligatoria al crear'
      else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
    }
    
    if (roleIds.length === 0) newErrors.roles = 'Debes seleccionar al menos un rol'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (isEditing && usuarioEditar) {
        await actualizarUsuario({
          id: usuarioEditar.id,
          nombre_completo: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          avatar_url: avatarUrl,
          estado: estado,
          role_ids: roleIds,
        })
        toast.success('Usuario actualizado', 'Los cambios se guardaron correctamente')
      } else {
        await crearUsuario({
          nombre_completo: nombre.trim(),
          email: email.trim(),
          password: password.trim(),
          telefono: telefono.trim() || undefined,
          avatar_url: avatarUrl,
          estado: estado,
          role_ids: roleIds,
        })
        toast.success('Usuario creado', 'El usuario se registró exitosamente')
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
    setNombre('')
    setEmail('')
    setPassword('')
    setTelefono('')
    setEstado('activo')
    setRoleIds([])
    setAvatarUrl('')
    setErrors({})
    onOpenChange(false)
  }

  const toggleRole = (roleId: number) => {
    setRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ]

  return (
    <FormShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      description={isEditing ? 'Modifica la información del usuario' : 'Completa la información para registrar un nuevo usuario'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
    >
      <div className="space-y-4">
        {/* Upload de Avatar */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            onRemove={() => setAvatarUrl('')}
            bucket="avatars"
            folder="users"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'U'}
            label="Foto de Perfil"
            maxSizeMB={2}
          />
        </div>

        {/* Nombre y Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre Completo"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errors.nombre) setErrors({ ...errors, nombre: '' })
            }}
            placeholder="Ej: Juan Pérez"
            error={errors.nombre}
            required
          />
          <FormField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors({ ...errors, email: '' })
            }}
            placeholder="usuario@correascenter.com"
            error={errors.email}
            required
            disabled={isEditing} // El email no se debe cambiar fácilmente en edición
            helpText={isEditing ? "El email no se puede modificar" : "Se usará para iniciar sesión"}
          />
        </div>

        {/* Teléfono y Contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+591 7 1234567"
          />
          {!isEditing && (
            <FormField
              label="Contraseña Temporal"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              required
            />
          )}
        </div>

        {/* Roles */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Asignar Roles *
          </label>
          <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800/50 max-h-40 overflow-y-auto">
            {rolesDisponibles.length > 0 ? (
              rolesDisponibles.map((role) => (
                <CheckboxField
                  key={role.id}
                  label={role.nombre}
                  name={`role-${role.id}`}
                  checked={roleIds.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No hay roles disponibles
              </p>
            )}
          </div>
          {errors.roles && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.roles}</p>
          )}
        </div>

        {/* Estado */}
        <SelectField
          label="Estado del Usuario"
          name="estado"
          value={estado}
          onValueChange={(val) => setEstado(val as 'activo' | 'inactivo')}
          options={estadoOptions}
        />
      </div>
    </FormShell>
  )
}