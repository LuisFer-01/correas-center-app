import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    getRegistros,
} from '@/admin/services/registro.service'
import type { Registro } from '@/admin/types/registro'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SquareLibrary, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RegistroContenidoManager } from './components/RegistroContenidoManager'

export const RegistrosIndex = () => {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isManagerOpen, setIsManagerOpen] = useState(false)
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Registro | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)

  const loadRegistros = async () => {
    setIsLoading(true)
    try {
      const data = await getRegistros(true)
      setRegistros(data)
    } catch (error) {
      console.error('Error al cargar registros:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los registros')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRegistros()
  }, [])

  const handleOpenManager = (registro: Registro) => {
    setRegistroSeleccionado(registro)
    setIsManagerOpen(true)
  }

  const handleSuccess = () => {
    loadRegistros()
  }

  const filteredRegistros = registros.filter((r) => {
    if (r.estado === 'eliminado') {
      return showDeleted
    }
    return true
  })

  const columns: ColumnDef<Registro>[] = [
    {
      accessorKey: 'identificador',
      header: 'Registro',
      cell: ({ row }) => (
        <div>
          <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
            <Type className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            {row.original.nombre}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
            {row.getValue('identificador')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {row.getValue('descripcion') || '—'}
        </div>
      ),
    },
    {
      id: 'conteo_contenidos',
      header: 'Contenidos',
      cell: ({ row }) => {
        const registro = row.original
        const conteo = registro.conteo_contenidos || 0
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {conteo}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-[#EA0A2A] dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => handleOpenManager(registro)}
              title="Gestionar contenidos"
            >
              <SquareLibrary className="h-4 w-4" />
            </Button>
          </div>
        )
      },
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
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registros / About"
        description="Gestiona el contenido de las secciones del 'Sobre Nosotros'"
        actions={
          <>
            <RequirePermission permission="registros.view_deleted">
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
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRegistros}
        searchKey="nombre"
        searchPlaceholder="Buscar registros..."
        isLoading={isLoading}
      />

      {registroSeleccionado && (
        <RegistroContenidoManager
          open={isManagerOpen}
          onOpenChange={setIsManagerOpen}
          registro={registroSeleccionado}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}