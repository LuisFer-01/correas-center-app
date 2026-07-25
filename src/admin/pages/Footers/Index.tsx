import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarFooter,
    getFooters,
    restaurarFooter,
} from '@/admin/services/footer.service'
import type { Footer } from '@/admin/types/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FooterForm } from './components/FooterForm'

export const FootersIndex = () => {
  const [footers, setFooters] = useState<Footer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [footerEditar, setFooterEditar] = useState<Footer | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [footerEliminar, setFooterEliminar] = useState<Footer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadFooters = async () => {
    setIsLoading(true)
    try {
      const data = await getFooters(true)
      setFooters(data)
    } catch (error) {
      console.error('Error al cargar footers:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los footers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFooters()
  }, [])

  const handleNuevoFooter = () => {
    setFooterEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarFooter = (footer: Footer) => {
    setFooterEditar(footer)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (footer: Footer) => {
    setFooterEliminar(footer)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!footerEliminar) return
    setIsDeleting(true)
    try {
      await eliminarFooter(footerEliminar.id)
      toast.success('Footer eliminado', 'El footer se marcó como eliminado')
      setIsDeleteOpen(false)
      setFooterEliminar(null)
      await loadFooters()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (footer: Footer) => {
    try {
      await restaurarFooter(footer.id)
      toast.success('Footer restaurado', 'El footer volvió a estado activo')
      await loadFooters()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setFooterEditar(null)
    loadFooters()
  }

  const filteredFooters = footers.filter((f) => {
    if (f.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  // Mapa de colores para los tipos
  const tipoColors: Record<string, string> = {
    producto: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    industria: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    servicio: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    red_social: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }

  const columns: ColumnDef<Footer>[] = [
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.getValue('tipo') as string
        return (
          <Badge className={tipoColors[tipo] || 'bg-gray-100'}>
            {tipo === 'red_social' ? 'Red Social' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'tipo_registro',
      header: 'Tipo Registro',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.getValue('tipo_registro') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'registro_id',
      header: 'Registro ID',
      cell: ({ row }) => (
        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {row.getValue('registro_id') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'titulo',
      header: 'Título',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {row.getValue('titulo') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'url',
      header: 'URL',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {row.getValue('url') || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'icono',
      header: 'Icono',
      cell: ({ row }) => (
        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {row.getValue('icono') || '—'}
        </div>
      ),
    },
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
      accessorKey: 'mostrar',
      header: 'Mostrar',
      cell: ({ row }) => (
        <Badge variant={row.getValue('mostrar') ? 'default' : 'secondary'} className={row.getValue('mostrar') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}>
          {row.getValue('mostrar') ? 'Sí' : 'No'}
        </Badge>
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
        const footer = row.original

        if (footer.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(footer)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="footers.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarFooter(footer)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="footers.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(footer)}
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
        title="Footers"
        description="Gestiona los elementos del pie de página del sitio"
        actions={
          <>
            <RequirePermission permission="footers.view_deleted">
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
            <RequirePermission permission="footers.create">
              <Button
                onClick={handleNuevoFooter}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Footer
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredFooters}
        searchKey="titulo"
        searchPlaceholder="Buscar footers..."
        isLoading={isLoading}
      />

      <FooterForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        footerEditar={footerEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este footer?"
        description={`Se marcará como eliminado el footer "${footerEliminar?.titulo || 'sin título'}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}