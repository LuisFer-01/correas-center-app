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
} from '@/admin/services/rol.service'
import type { PermisosAgrupados, Rol } from '@/admin/types/rol'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Shield, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RolForm } from './components/RolForm'

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

  const handleEliminarClick = (rol: Rol) => {
    setRolEliminar(rol)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!rolEliminar) return
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

  const handleRestaurar = async (rol: Rol) => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('roles')
        .update({ estado: 'activo', eliminado_en: null })
        .eq('id', rol.id)
      
      if (error) throw new Error(error.message)
      
      toast.success('Rol restaurado', 'El rol volvió a estado activo')
      await loadData()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setRolEditar(null)
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
            <div className="font-medium text-gray-900 dark:text-white">
              {row.getValue('nombre')}
            </div>
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
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.original.permisos.length}
          </span>
          <span className="text-gray-500 dark:text-gray-400"> permisos asignados</span>
        </div>
      ),
    },
    {
      accessorKey: 'es_sistema',
      header: 'Tipo',
      cell: ({ row }) => (
        <div>
          {row.original.es_sistema ? (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Sistema
            </Badge>
          ) : (
            <Badge variant="outline" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              Personalizado
            </Badge>
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
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="roles.update">
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
            <RequirePermission permission="roles.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(rol)}
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
            <RequirePermission permission="roles.create">
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