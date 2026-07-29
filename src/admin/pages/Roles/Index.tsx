import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
  eliminarRol,
  getPermisosAgrupados,
  getRoles,
  restaurarRol,
} from '@/admin/services/rol.service'
import type { PermisosAgrupados, Rol } from '@/admin/types/rol'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Shield, Trash2, UserRoundKey } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RolForm } from './components/RolForm'
import { RolPermisosModal } from './components/RolPermisosModal'

export const RolesIndex = () => {
  const [roles, setRoles] = useState<Rol[]>([])
  const [permisosAgrupados, setPermisosAgrupados] = useState<PermisosAgrupados>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [rolEditar, setRolEditar] = useState<Rol | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [rolEliminar, setRolEliminar] = useState<Rol | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  
  // ✅ NUEVOS: Estados para el modal de permisos
  const [isPermisosOpen, setIsPermisosOpen] = useState(false)
  const [rolPermisos, setRolPermisos] = useState<Rol | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [rolesData, permisosData] = await Promise.all([
        getRoles(true),
        getPermisosAgrupados(),
      ])
      setRoles(rolesData)
      setPermisosAgrupados(permisosData)
    } catch (error) {
      console.error('Error al cargar roles:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los roles')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNuevoRol = () => {
    setRolEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarRol = (rol: Rol) => {
    setRolEditar(rol)
    setIsFormOpen(true)
  }

  // ✅ NUEVO: Abrir modal de permisos
  const handleGestionarPermisos = (rol: Rol) => {
    setRolPermisos(rol)
    setIsPermisosOpen(true)
  }

  const handleEliminarClick = (rol: Rol) => {
    setRolEliminar(rol)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!rolEliminar) return
    if (rolEliminar.es_sistema) {
      toast.error('Error', 'No se pueden eliminar roles del sistema')
      setIsDeleteOpen(false)
      return
    }
    
    setIsDeleting(true)
    try {
      await eliminarRol(rolEliminar.id)
      toast.success('Rol eliminado', 'El rol se marcó como eliminado')
      setIsDeleteOpen(false)
      setRolEliminar(null)
      await loadData()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  // ✅ IMPLEMENTADO: Función de restaurar
  const handleRestaurar = async (rol: Rol) => {
    setIsRestoring(true)
    try {
      await restaurarRol(rol.id)
      toast.success('Rol restaurado', `El rol "${rol.nombre}" volvió a estado activo`)
      await loadData()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setRolEditar(null)
    loadData()
  }

  const handlePermisosSuccess = () => {
    setIsPermisosOpen(false)
    setRolPermisos(null)
    loadData()
  }

  const filteredRoles = roles.filter((r) => {
    if (r.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Rol>[] = [
    {
      accessorKey: 'nombre',
      header: 'Rol',
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="font-medium text-gray-900 dark:text-white">{row.getValue('nombre')}</div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {row.original.slug}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
          {row.getValue('descripcion') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'permisos',
      header: 'Permisos',
      cell: ({ row }) => {
        const rol = row.original
        const cantidad = rol.permisos.length
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {cantidad}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-[#EA0A2A] dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => handleGestionarPermisos(rol)}
              title="Gestionar permisos"
            >
              <UserRoundKey className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'es_sistema',
      header: 'Tipo',
      cell: ({ row }) => (
        <div>
          {row.original.es_sistema ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Sistema
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Personalizado
            </span>
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
        const rol = row.original

        if (rol.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(rol)}
              disabled={isRestoring}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="roles.manage">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarRol(rol)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="roles.manage">
              <Button
                variant="ghost"
                size="icon"
                className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 ${
                  rol.es_sistema ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !rol.es_sistema && handleEliminarClick(rol)}
                title={rol.es_sistema ? 'No se puede eliminar roles de sistema' : 'Eliminar'}
                disabled={rol.es_sistema}
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
        title="Roles y Permisos"
        description="Gestiona los roles del sistema y sus permisos de acceso"
        actions={
          <>
            <RequirePermission permission="roles.view_deleted">
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
            <RequirePermission permission="roles.manage">
              <Button
                onClick={handleNuevoRol}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rol
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRoles}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre o slug..."
        isLoading={isLoading}
      />

      <RolForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        permisosAgrupados={permisosAgrupados} 
        rolEditar={rolEditar}
        onSuccess={handleSuccess}
      />

      {/* ✅ NUEVO: Modal de gestión de permisos */}
      <RolPermisosModal
        open={isPermisosOpen}
        onOpenChange={setIsPermisosOpen}
        rol={rolPermisos}
        permisosAgrupados={permisosAgrupados}
        onSuccess={handlePermisosSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este rol?"
        description={`Se marcará como eliminado el rol "${rolEliminar?.nombre}". Los usuarios asignados a este rol perderán sus permisos.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}