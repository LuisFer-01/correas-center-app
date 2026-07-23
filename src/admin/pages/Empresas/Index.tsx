import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarEmpresa,
    getEmpresas,
    restaurarEmpresa,
} from '@/admin/services/empresa.service'
import type { Empresa } from '@/admin/types/empresa'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Building2, Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmpresaForm } from './components/EmpresaForm'

export const EmpresasIndex = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [empresaEditar, setEmpresaEditar] = useState<Empresa | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [empresaEliminar, setEmpresaEliminar] = useState<Empresa | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadEmpresas = async () => {
    setIsLoading(true)
    try {
      const data = await getEmpresas(true) // Incluir eliminados
      setEmpresas(data)
    } catch (error) {
      console.error('Error al cargar empresas:', error)
      toast.error('Error al cargar', 'No se pudieron obtener las empresas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  const handleNuevaEmpresa = () => {
    setEmpresaEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaEditar(empresa)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (empresa: Empresa) => {
    setEmpresaEliminar(empresa)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!empresaEliminar) return
    setIsDeleting(true)
    try {
      await eliminarEmpresa(empresaEliminar.id)
      toast.success('Empresa eliminada', 'La empresa se marcó como eliminada')
      setIsDeleteOpen(false)
      setEmpresaEliminar(null)
      await loadEmpresas()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (empresa: Empresa) => {
    try {
      await restaurarEmpresa(empresa.id)
      toast.success('Empresa restaurada', 'La empresa volvió a estado activo')
      await loadEmpresas()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setEmpresaEditar(null)
    loadEmpresas()
  }

  // Filtrar empresas según si mostrar eliminadas
  const filteredEmpresas = empresas.filter((e) => {
    if (e.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Empresa>[] = [
    {
      accessorKey: 'logo',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage
            src={row.original.logo}
            alt={row.original.nombre}
            className="object-contain p-1"
          />
          <AvatarFallback className="bg-[#EA0A2A] text-white rounded-lg">
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.getValue('nombre')}
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('estado')} />,
    },
    {
      accessorKey: 'creado_en',
      header: 'Creado',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.getValue('creado_en')).toLocaleDateString('es-BO')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const empresa = row.original

        if (empresa.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(empresa)}
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
              onClick={() => handleEditarEmpresa(empresa)}
              title="Editar"
              className="dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => handleEliminarClick(empresa)}
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
        title="Empresas"
        description="Gestiona las empresas del sistema y sus logos corporativos"
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
              onClick={handleNuevaEmpresa}
              className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredEmpresas}
        searchKey="nombre"
        searchPlaceholder="Buscar empresas..."
        isLoading={isLoading}
      />

      <EmpresaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        empresaEditar={empresaEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar esta empresa?"
        description={`Se marcará como eliminada la empresa "${empresaEliminar?.nombre}". El registro se mantendrá en la base de datos para auditoría.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}