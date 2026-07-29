import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
  eliminarUsuario,
  getRolesDisponibles,
  getUsuarios,
  restaurarUsuario,
  verificarUsuario, // ✅ NUEVO
} from '@/admin/services/usuario.service'
import type { Role, UserProfile } from '@/admin/types/usuario'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle2, Eye, Pencil, Plus, RotateCcw, Trash2, UserCheck } from 'lucide-react'; // ✅ UserCheck agregado
import { useEffect, useState } from 'react'
import { UsuarioForm } from './components/UsuarioForm'

export const UsuariosIndex = () => {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<UserProfile | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [usuarioEliminar, setUsuarioEliminar] = useState<UserProfile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usuariosData, rolesData] = await Promise.all([
        getUsuarios(true),
        getRolesDisponibles(),
      ])
      setUsuarios(usuariosData)
      setRoles(rolesData)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarUsuario = (usuario: UserProfile) => {
    setUsuarioEditar(usuario)
    setIsFormOpen(true)
  }

  // ✅ NUEVO: Verificar usuario
  const handleVerificarUsuario = async (usuario: UserProfile) => {
    try {
      await verificarUsuario(usuario.id)
      toast.success('Usuario verificado', 'El email del usuario ha sido verificado')
      await loadData()
    } catch (error: any) {
      toast.error('Error al verificar', error.message || 'Ocurrió un error')
    }
  }

  const handleEliminarClick = (usuario: UserProfile) => {
    setUsuarioEliminar(usuario)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!usuarioEliminar) return
    
    // Validación de seguridad frontend (la RLS también lo protege)
    const esSuperAdmin = usuarioEliminar.roles.some((r) => r.slug === 'super_admin')
    if (esSuperAdmin) {
      toast.error('Acción no permitida', 'No se puede eliminar al usuario Super Admin')
      setIsDeleteOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      await eliminarUsuario(usuarioEliminar.id)
      toast.success('Usuario eliminado', 'El usuario se marcó como eliminado')
      setIsDeleteOpen(false)
      setUsuarioEliminar(null)
      await loadData()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (usuario: UserProfile) => {
    try {
      await restaurarUsuario(usuario.id)
      toast.success('Usuario restaurado', 'El usuario volvió a estado activo')
      await loadData()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setUsuarioEditar(null)
    loadData()
  }

  const filteredUsuarios = usuarios.filter((u) => {
    if (u.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: 'avatar_url',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-10 w-10 border bg-white dark:bg-gray-700">
          <AvatarImage src={row.original.avatar_url} alt={row.original.nombre_completo} />
          <AvatarFallback className="bg-[#EA0A2A] text-white">
            {row.original.nombre_completo?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre_completo',
      header: 'Usuario',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.getValue('nombre_completo')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.email}
          </div>
          {row.original.telefono && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {row.original.telefono}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge 
              key={role.id} 
              variant={role.slug === 'super_admin' ? 'default' : 'outline'}
              className={role.slug === 'super_admin' ? 'bg-[#EA0A2A] text-white' : 'text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}
            >
              {role.nombre}
            </Badge>
          ))}
          {row.original.roles.length === 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Sin roles</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('estado')} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original
        const esSuperAdmin = usuario.roles.some((r) => r.slug === 'super_admin')
        const estaVerificado = usuario.email_verified_at !== null && usuario.email_verified_at !== undefined

        if (usuario.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(usuario)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            {/* ✅ NUEVO: Botón Verificar (solo si no está verificado y no es super_admin) */}
            {!estaVerificado && !esSuperAdmin && (
              <RequirePermission permission="usuarios.verify">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVerificarUsuario(usuario)}
                  title="Verificar email"
                  className="dark:text-gray-300 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </RequirePermission>
            )}
            
            {/* Indicador de verificado */}
            {estaVerificado && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Email verificado">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}

            <RequirePermission permission="usuarios.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarUsuario(usuario)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="usuarios.delete">
              <Button
                variant="ghost"
                size="icon"
                className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 ${
                  esSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !esSuperAdmin && handleEliminarClick(usuario)}
                title={esSuperAdmin ? 'No se puede eliminar al Super Admin' : 'Eliminar'}
                disabled={esSuperAdmin}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </RequirePermission>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios y Roles"
        description="Gestiona los usuarios del sistema y sus permisos de acceso"
        actions={
          <>
            <RequirePermission permission="usuarios.view_deleted">
              <Button
                variant={showDeleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowDeleted(!showDeleted)}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDeleted ? 'Ocultar Eliminados' : 'Ver Eliminados'}
              </Button>
            </RequirePermission>
            <RequirePermission permission="usuarios.create">
              <Button
                onClick={handleNuevoUsuario}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredUsuarios}
        searchKey="nombre_completo"
        searchPlaceholder="Buscar por nombre, email o teléfono..."
        isLoading={isLoading}
      />

      <UsuarioForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rolesDisponibles={roles}
        usuarioEditar={usuarioEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este usuario?"
        description={`Se marcará como eliminado a "${usuarioEliminar?.nombre_completo}". El registro se mantendrá en la base de datos para auditoría.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}