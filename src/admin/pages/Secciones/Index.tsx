import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
  eliminarContenido,
  getContenidos,
  restaurarContenido,
} from '@/admin/services/contenido.service'
import type { ContenidoSeccion } from '@/admin/types/contenido'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Image, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ContenidoForm } from './components/ContenidoForm'

export const SeccionesIndex = () => {
  const [contenidos, setContenidos] = useState<ContenidoSeccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [contenidoEditar, setContenidoEditar] = useState<ContenidoSeccion | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [contenidoEliminar, setContenidoEliminar] = useState<ContenidoSeccion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadContenidos = async () => {
    setIsLoading(true)
    try {
      const data = await getContenidos(true)
      setContenidos(data)
    } catch (error) {
      console.error('Error al cargar contenidos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los contenidos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContenidos()
  }, [])

  const handleNuevoContenido = () => {
    setContenidoEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarContenido = (contenido: ContenidoSeccion) => {
    setContenidoEditar(contenido)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (contenido: ContenidoSeccion) => {
    setContenidoEliminar(contenido)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!contenidoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarContenido(contenidoEliminar.id)
      toast.success('Contenido eliminado', 'El contenido se marcó como eliminado')
      setIsDeleteOpen(false)
      setContenidoEliminar(null)
      await loadContenidos()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (contenido: ContenidoSeccion) => {
    try {
      await restaurarContenido(contenido.id)
      toast.success('Contenido restaurado', 'El contenido volvió a estado activo')
      await loadContenidos()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setContenidoEditar(null)
    loadContenidos()
  }

  const filteredContenidos = contenidos.filter((c) => {
    if (c.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<ContenidoSeccion>[] = [
    {
      accessorKey: 'imagen',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-12 w-12 rounded-lg border bg-white dark:bg-gray-700">
          <AvatarImage
            src={row.original.imagen ?? undefined}
            alt={row.original.titulo || 'Imagen'}
            className="object-contain p-1"
          />
          <AvatarFallback className="bg-[#EA0A2A] text-white rounded-lg">
            <Image className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'titulo',
      header: 'Contenido',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.getValue('titulo') || 'Sin título'}
          </div>
          {row.original.subtitulo && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.subtitulo}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tipo_seccion',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          {row.original.tipo_seccion?.nombre || '—'}
        </Badge>
      ),
    },
    // ✅ COLUMNA OCULTA para permitir búsqueda por nombre de tipo de sección
    {
      id: 'tipo_seccion_nombre',
      accessorFn: (row) => row.tipo_seccion?.nombre || '',
      header: () => null,
      cell: () => null,
      enableHiding: true,
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
      id: 'metadata',
      header: 'Metadata',
      cell: ({ row }) => {
        const metadata = row.original.metadata || {}
        const entries = Object.entries(metadata).filter(([_, v]) => v)
        if (entries.length === 0) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {entries.slice(0, 3).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="font-mono text-xs dark:bg-gray-600 dark:text-gray-200">
                {key}: {String(value).slice(0, 12)}
              </Badge>
            ))}
            {entries.length > 3 && (
              <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                +{entries.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'mostrar',
      header: 'Mostrar',
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className={row.getValue('mostrar') 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' 
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
          }
        >
          {row.getValue('mostrar') ? 'Sí' : 'No'}
        </Badge>
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
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.getValue('estado')} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const contenido = row.original

        if (contenido.estado === 'eliminado') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(contenido)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="contenido.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarContenido(contenido)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="contenido.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(contenido)}
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
        title="Secciones"
        description="Gestiona el contenido de las secciones del sitio (Heroes, Diferenciales, etc.)"
        actions={
          <>
            <RequirePermission permission="contenido.view_deleted">
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
            <RequirePermission permission="contenido.create">
              <Button
                onClick={handleNuevoContenido}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Contenido
              </Button>
            </RequirePermission>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredContenidos}
        searchKey="titulo"
        searchPlaceholder="Buscar por título o tipo de sección..."
        isLoading={isLoading}
      />

      <ContenidoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contenidoEditar={contenidoEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Eliminar este contenido?"
        description={`Se marcará como eliminado el contenido "${contenidoEliminar?.titulo || 'sin título'}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}