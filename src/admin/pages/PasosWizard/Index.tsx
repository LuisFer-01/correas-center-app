import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarPasoWizard,
    getPasosWizard,
    restaurarPasoWizard,
} from '@/admin/services/paso-wizard.service'
import type { PasoWizard } from '@/admin/types/pasos-wizard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PasoWizardForm } from './components/PasoWizardForm'

export const PasosWizardIndex = () => {
  const [pasos, setPasos] = useState<PasoWizard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [pasoEditar, setPasoEditar] = useState<PasoWizard | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [pasoEliminar, setPasoEliminar] = useState<PasoWizard | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadPasos = async () => {
    setIsLoading(true)
    try {
      const data = await getPasosWizard(true)
      setPasos(data)
    } catch (error) {
      console.error('Error al cargar pasos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los pasos del wizard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPasos()
  }, [])

  const handleNuevoPaso = () => {
    setPasoEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarPaso = (paso: PasoWizard) => {
    setPasoEditar(paso)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (paso: PasoWizard) => {
    setPasoEliminar(paso)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!pasoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarPasoWizard(pasoEliminar.id)
      toast.success('Paso eliminado', 'El paso se marcó como eliminado')
      setIsDeleteOpen(false)
      setPasoEliminar(null)
      await loadPasos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (paso: PasoWizard) => {
    try {
      await restaurarPasoWizard(paso.id)
      toast.success('Paso restaurado', 'El paso volvió a estado activo')
      await loadPasos()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setPasoEditar(null)
    loadPasos()
  }

  const filteredPasos = pasos.filter((p) => {
    if (p.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<PasoWizard>[] = [
    {
      accessorKey: 'orden',
      header: 'Orden',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.getValue('orden')}
        </Badge>
      ),
    },
    {
      accessorKey: 'titulo',
      header: 'Paso',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Wand2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.getValue('titulo')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {row.original.identificador}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'fuente_datos',
      header: 'Fuente',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-xs dark:bg-gray-600 dark:text-gray-200">
          {row.getValue('fuente_datos')}
        </Badge>
      ),
    },
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.original.empresa?.nombre || '—'}
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
        const paso = row.original

        if (paso.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(paso)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="wizard.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarPaso(paso)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="wizard.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(paso)}
                title="Eliminar"
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
        title="Pasos del Wizard"
        description="Configura los pasos del asistente de selección para clientes"
        actions={
          <>
            <RequirePermission permission="wizard.view_deleted">
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
            <RequirePermission permission="wizard.create">
              <Button
                onClick={handleNuevoPaso}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paso
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredPasos}
        searchKey="titulo"
        searchPlaceholder="Buscar pasos del wizard..."
        isLoading={isLoading}
      />

      <PasoWizardForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        pasoEditar={pasoEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este paso del wizard?"
        description={`Se marcará como eliminado el paso "${pasoEliminar?.titulo}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}