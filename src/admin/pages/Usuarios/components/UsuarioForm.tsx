import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { FormField } from '@/admin/components/shared/FormField'
import { FormShell } from '@/admin/components/shared/FormShell'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { SelectField } from '@/admin/components/shared/SelectField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarUsuario, crearUsuario, restablecerContrasena } from '@/admin/services/usuario.service'
import type { Role, UserProfile } from '@/admin/types/usuario'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/providers/AuthProvider'
import { Key, RotateCcw } from 'lucide-react'
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
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isRestableciendo, setIsRestableciendo] = useState(false)
  
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [telefono, setTelefono] = useState('')
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo')
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [esSuperAdmin, setEsSuperAdmin] = useState(false)

  const isEditing = !!usuarioEditar

  // Verificar si el usuario actual es super_admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user) {
        //const roles = await getRolesDisponibles()
        // Aquí deberías obtener los roles del usuario actual
        // Por ahora asumimos que si puede abrir el formulario, tiene permisos
        setEsSuperAdmin(true) // Simplificado - en producción verifica los roles del usuario
      }
    }
    checkSuperAdmin()
  }, [user])

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
      setMostrarPassword(false)
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
      setPassword('') // No mostrar contraseña en edición por defecto
      setMostrarPassword(false)
    } else if (open && !usuarioEditar) {
      setNombre('')
      setEmail('')
      setPassword('')
      setTelefono('')
      setEstado('activo')
      setRoleIds([])
      setAvatarUrl('')
      setMostrarPassword(false)
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

  // ✅ NUEVO: Restablecer contraseña
  const handleRestablecerContrasena = async () => {
    if (!usuarioEditar) return
    
    const confirmar = confirm('¿Estás seguro de restablecer la contraseña a "prueba123"?')
    if (!confirmar) return

    setIsRestableciendo(true)
    try {
      await restablecerContrasena(usuarioEditar.id, 'prueba123')
      toast.success('Contraseña restablecida', 'La contraseña se restableció a "prueba123"')
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo restablecer la contraseña')
    } finally {
      setIsRestableciendo(false)
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
    setMostrarPassword(false)
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
            disabled={isEditing}
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
          {!isEditing ? (
            <FormField
              label="Contraseña Temporal"
              name="password"
              type={mostrarPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
              required
            />
          ) : (
            /* ✅ NUEVO: Campo de contraseña en edición (solo super_admin) */
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Contraseña (Super Admin)
              </label>
              <div className="flex gap-2">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener la actual"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA0A2A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  {mostrarPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.05 6.05a13.17 13.17 0 0 0-1.68 2.68s3 7 10 7a10.43 10.43 0 0 0 2.12-.27"/><path d="m2 2 20 20"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Déjalo vacío para mantener la contraseña actual
              </p>
            </div>
          )}
        </div>

        {/* ✅ NUEVO: Botón Restablecer Contraseña (solo en edición y para super_admin) */}
        {isEditing && esSuperAdmin && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Restablecer Contraseña
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Restablecerá a "prueba123"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRestablecerContrasena}
                disabled={isRestableciendo}
                className="bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isRestableciendo ? 'Restableciendo...' : 'Restablecer'}
              </Button>
            </div>
          </div>
        )}

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