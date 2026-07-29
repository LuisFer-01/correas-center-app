import { FormField } from '@/admin/components/shared/FormField'
import { ImageUpload } from '@/admin/components/shared/ImageUpload'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarPerfil, cambiarPassword } from '@/admin/services/perfil.service'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { useAdminContext } from '@/providers/AdminProvider'
import { ChevronDown, Key } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PerfilForm() {
  const { perfil, refreshPerfil } = useAdminContext()
  const [isLoading, setIsLoading] = useState(false)
  
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  const [cambiarPass, setCambiarPass] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos actuales del perfil
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre_completo || '')
      setTelefono(perfil.telefono || '')
      setAvatarUrl(perfil.avatar_url || '')
    }
  }, [perfil])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    
    if (cambiarPass) {
      if (!nuevaPassword) newErrors.nuevaPassword = 'La contraseña es obligatoria'
      else if (nuevaPassword.length < 6) newErrors.nuevaPassword = 'Mínimo 6 caracteres'
      
      if (nuevaPassword !== confirmarPassword) {
        newErrors.confirmarPassword = 'Las contraseñas no coinciden'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // 1. Actualizar datos del perfil
      await actualizarPerfil({
        nombre_completo: nombre.trim(),
        telefono: telefono.trim() || null,
        avatar_url: avatarUrl || null,
      })

      // 2. Actualizar contraseña si se solicitó
      if (cambiarPass && nuevaPassword) {
        await cambiarPassword(nuevaPassword)
      }

      // 3. Refrescar el contexto para actualizar el Header inmediatamente
      await refreshPerfil()
      
      toast.success('Perfil actualizado', 'Tus datos se guardaron correctamente')
      
      // Limpiar campos de contraseña
      setCambiarPass(false)
      setNuevaPassword('')
      setConfirmarPassword('')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al guardar', error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (!perfil) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA0A2A]"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <ImageUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            onRemove={() => setAvatarUrl('')}
            bucket="avatars"
            folder="users"
            fallbackText={nombre?.charAt(0).toUpperCase() || 'U'}
            label="Foto de Perfil"
            maxSizeMB={5}
        />
      </div>

      {/* Datos Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
        
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
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Correo Electrónico</Label>
            <input
              type="email"
              value={perfil.email || ''}
              disabled
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              El correo no se puede modificar desde aquí
            </p>
          </div>
        </div>

        <FormField
          label="Teléfono"
          name="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+591 7 1234567"
        />
      </div>

      {/* Cambio de Contraseña (Opcional) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <Collapsible open={cambiarPass} onOpenChange={setCambiarPass}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Cambiar Contraseña
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${cambiarPass ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4 space-y-4">
            <FormField
              label="Nueva Contraseña"
              name="nuevaPassword"
              type="password"
              value={nuevaPassword}
              onChange={(e) => {
                setNuevaPassword(e.target.value)
                if (errors.nuevaPassword) setErrors({ ...errors, nuevaPassword: '' })
              }}
              placeholder="Mínimo 6 caracteres"
              error={errors.nuevaPassword}
            />
            
            <FormField
              label="Confirmar Contraseña"
              name="confirmarPassword"
              type="password"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value)
                if (errors.confirmarPassword) setErrors({ ...errors, confirmarPassword: '' })
              }}
              placeholder="Repite la nueva contraseña"
              error={errors.confirmarPassword}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Botón de Guardar */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825] text-white"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}