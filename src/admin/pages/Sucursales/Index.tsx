import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarSucursal,
    getSucursales,
    restaurarSucursal,
} from '@/admin/services/sucursal.service'
import type { Sucursal } from '@/admin/types/sucursal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MapPin, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SucursalForm } from './components/SucursalForm'

export const SucursalesIndex = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [sucursalEditar, setSucursalEditar] = useState<Sucursal | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [sucursalEliminar, setSucursalEliminar] = useState<Sucursal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadSucursales = async () => {
    setIsLoading(true)
    try {
      const data = await getSucursales(true) // Incluir eliminados
      setSucursales(data)
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
      toast.error('Error al cargar', 'No se pudieron obtener las sucursales')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSucursales()
  }, [])

  const handleNuevaSucursal = () => {
    setSucursalEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarSucursal = (sucursal: Sucursal) => {
    setSucursalEditar(sucursal)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (sucursal: Sucursal) => {
    setSucursalEliminar(sucursal)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!sucursalEliminar) return
    setIsDeleting(true)
    try {
      await eliminarSucursal(sucursalEliminar.id)
      toast.success('Sucursal eliminada', 'La sucursal se marcó como eliminada')
      setIsDeleteOpen(false)
      setSucursalEliminar(null)
      await loadSucursales()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (sucursal: Sucursal) => {
    try {
      await restaurarSucursal(sucursal.id)
      toast.success('Sucursal restaurada', 'La sucursal volvió a estado activo')
      await loadSucursales()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setSucursalEditar(null)
    loadSucursales()
  }

  // Filtrar sucursales según si mostrar eliminadas
  const filteredSucursales = sucursales.filter((s) => {
    if (s.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Sucursal>[] = [
    {
      accessorKey: 'nombre',
      header: 'Sucursal',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            {row.original.nombre}
            {row.original.es_principal && (
              <Badge variant="default" className="bg-[#EA0A2A] text-white text-[10px]">
                Principal
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {row.original.direccion}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-white">{row.getValue('telefono')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">{row.getValue('email') || '-'}</div>
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
        const sucursal = row.original

        if (sucursal.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(sucursal)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditarSucursal(sucursal)}
              title="Editar"
              className="dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => handleEliminarClick(sucursal)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        description="Gestiona las sedes, direcciones y datos de contacto."
        actions={
          <>
            <Button
              variant={showDeleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDeleted(!showDeleted)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDeleted ? 'Ocultar Eliminadas' : 'Ver Eliminadas'}
            </Button>
            <Button
              onClick={handleNuevaSucursal}
              className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sucursal
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredSucursales}
        searchKey="nombre"
        searchPlaceholder="Buscar sucursales..."
        isLoading={isLoading}
      />

      <SucursalForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        sucursalEditar={sucursalEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar esta sucursal?"
        description={`Se marcará como eliminada la sucursal "${sucursalEliminar?.nombre}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}