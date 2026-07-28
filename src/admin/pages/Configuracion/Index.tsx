import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarConfiguracion,
    getConfiguracion,
    restaurarConfiguracion,
} from '@/admin/services/configuracion.service'
import type { ConfiguracionSitio } from '@/admin/types/configuracion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfiguracionForm } from './components/ConfiguracionForm'

export const ConfiguracionIndex = () => {
  const [configs, setConfigs] = useState<ConfiguracionSitio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [configEditar, setConfigEditar] = useState<ConfiguracionSitio | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [configEliminar, setConfigEliminar] = useState<ConfiguracionSitio | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos')

  const loadConfigs = async () => {
    setIsLoading(true)
    try {
      const data = await getConfiguracion()
      setConfigs(data)
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los datos de configuración')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  const handleNuevaConfig = () => {
    setConfigEditar(null)
    setIsFormOpen(true)
  }

  const handleEditarConfig = (config: ConfiguracionSitio) => {
    setConfigEditar(config)
    setIsFormOpen(true)
  }

  const handleEliminarClick = (config: ConfiguracionSitio) => {
    setConfigEliminar(config)
    setIsDeleteOpen(true)
  }

  const handleEliminarConfirm = async () => {
    if (!configEliminar) return
    setIsDeleting(true)
    try {
      await eliminarConfiguracion(configEliminar.id)
      toast.success('Configuración desactivada', 'El registro se marcó como inactivo')
      setIsDeleteOpen(false)
      setConfigEliminar(null)
      await loadConfigs()
    } catch (error: any) {
      toast.error('Error al eliminar', error.message || 'Ocurrió un error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestaurar = async (config: ConfiguracionSitio) => {
    try {
      await restaurarConfiguracion(config.id)
      toast.success('Configuración restaurada', 'El registro volvió a estado activo')
      await loadConfigs()
    } catch (error: any) {
      toast.error('Error al restaurar', error.message || 'Ocurrió un error')
    }
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setConfigEditar(null)
    loadConfigs()
  }

  // Filtrar por grupo y estado
  const filteredConfigs = configs.filter((c) => {
    if (!c.activo) return showInactive
    if (filtroGrupo !== 'todos' && c.grupo !== filtroGrupo) return false
    return true
  })

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      texto: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      numero: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      booleano: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      imagen: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      json: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return colors[tipo] || colors.texto
  }

  const columns: ColumnDef<ConfiguracionSitio>[] = [
    {
      accessorKey: 'clave',
      header: 'Clave',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {row.getValue('clave')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs truncate">
            {row.original.descripcion || 'Sin descripción'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'valor',
      header: 'Valor',
      cell: ({ row }) => {
        const val = row.getValue('valor') as string
        if (row.original.tipo === 'imagen') {
          return val ? (
            <div className="h-8 w-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img src={val} alt="preview" className="h-full w-full object-cover" />
            </div>
          ) : <span className="text-gray-400">—</span>
        }
        if (row.original.tipo === 'booleano') {
          return <Badge variant={val === 'true' ? 'default' : 'outline'} className="text-xs">{val === 'true' ? 'Sí' : 'No'}</Badge>
        }
        return (
          <div className="max-w-xs truncate text-sm text-gray-900 dark:text-gray-100 font-mono">
            {val || <span className="text-gray-400">—</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className={`text-xs ${getTipoColor(row.getValue('tipo') as string)}`}>
          {row.getValue('tipo')}
        </Badge>
      ),
    },
    {
      accessorKey: 'grupo',
      header: 'Grupo',
      cell: ({ row }) => (
        <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
          {(row.getValue('grupo') as string).replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.getValue('activo') ? 'default' : 'secondary'} className="text-xs">
          {row.getValue('activo') ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const config = row.original

        if (!config.activo) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestaurar(config)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Activar
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <RequirePermission permission="configuracion.update">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditarConfig(config)}
                title="Editar"
                className="dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </RequirePermission>
            <RequirePermission permission="configuracion.delete">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => handleEliminarClick(config)}
                title="Desactivar"
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
        title="Configuración del Sitio"
        description="Gestiona los parámetros globales del sitio web (SEO, Redes, WhatsApp, etc.)"
        actions={
          <>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showInactive ? 'Ocultar Inactivos' : 'Ver Inactivos'}
            </Button>
            <RequirePermission permission="configuracion.create">
              <Button
                onClick={handleNuevaConfig}
                className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Parámetro
              </Button>
            </RequirePermission>
          </>
        }
      />

      {/* Filtro por Grupo */}
      <div className="flex items-center gap-4">
        <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
          <SelectTrigger className="w-[250px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="todos">Todos los grupos</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="seo">SEO</SelectItem>
            <SelectItem value="contacto">Contacto</SelectItem>
            <SelectItem value="redes_sociales">Redes Sociales</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="chat">Chat (Tawk.to)</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredConfigs}
        searchKey="clave"
        searchPlaceholder="Buscar por clave o descripción..."
        isLoading={isLoading}
      />

      <ConfiguracionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        configEditar={configEditar}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleEliminarConfirm}
        title="¿Desactivar este parámetro?"
        description={`Se marcará como inactivo el parámetro "${configEliminar?.clave}". No se eliminará de la base de datos.`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}