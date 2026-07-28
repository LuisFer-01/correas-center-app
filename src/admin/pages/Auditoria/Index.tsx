import { DataTable } from '@/admin/components/shared/DataTable'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { toast } from '@/admin/components/shared/Toast'
import {
    exportarAuditoriaCSV,
    exportarAuditoriaExcel,
    getAccionesDisponibles,
    getAuditoriaLogs,
    getTablasAfectadas,
    getUsuariosConActividad,
} from '@/admin/services/auditoria.service'
import type { AuditoriaFilters, AuditoriaLog } from '@/admin/types/auditoria'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Database,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Info,
    Trash2,
    User,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AuditoriaDetailSheet } from './components/AuditoriaDetailSheet'

const PAGE_SIZE = 50

export const AuditoriaIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Estados de datos
  const [logs, setLogs] = useState<AuditoriaLog[]>([])
  const [total, setTotal] = useState(0)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [tablas, setTablas] = useState<string[]>([])
  const [acciones, setAcciones] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Estados de UI
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null)

  // Valores de filtros (sincronizados con URL)
  const usuarioFilter = searchParams.get('usuario_id') || 'all'
  const accionFilter = searchParams.get('accion') || 'all'
  const tablaFilter = searchParams.get('tabla') || 'all'
  const fechaInicio = searchParams.get('fecha_inicio') || ''
  const fechaFin = searchParams.get('fecha_fin') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [logsResult, usuariosData, tablasData, accionesData] = await Promise.all([
          getAuditoriaLogs({
            usuario_id: usuarioFilter !== 'all' ? usuarioFilter : undefined,
            accion: accionFilter !== 'all' ? accionFilter : undefined,
            tabla_afectada: tablaFilter !== 'all' ? tablaFilter : undefined,
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined,
            limit: PAGE_SIZE,
            offset: (currentPage - 1) * PAGE_SIZE,
          }),
          getUsuariosConActividad(),
          getTablasAfectadas(),
          getAccionesDisponibles(),
        ])
        setLogs(logsResult.logs)
        setTotal(logsResult.total)
        setUsuarios(usuariosData)
        setTablas(tablasData)
        setAcciones(accionesData)
      } catch (error) {
        console.error('Error al cargar auditoría:', error)
        toast.error('Error al cargar', 'No se pudieron obtener los registros de auditoría')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [usuarioFilter, accionFilter, tablaFilter, fechaInicio, fechaFin, currentPage])

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all' || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    newParams.set('page', '1') // Resetear a página 1 al cambiar filtros
    setSearchParams(newParams)
  }

  const handleClearFilters = () => {
    setSearchParams({})
  }

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
  }

  const handleViewDetail = (log: AuditoriaLog) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true)
    try {
      const filters: AuditoriaFilters = {
        usuario_id: usuarioFilter !== 'all' ? usuarioFilter : undefined,
        accion: accionFilter !== 'all' ? accionFilter : undefined,
        tabla_afectada: tablaFilter !== 'all' ? tablaFilter : undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      }

      const blob = format === 'csv' 
        ? await exportarAuditoriaCSV(filters)
        : await exportarAuditoriaExcel(filters)
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `auditoria_${timestamp}.${format === 'csv' ? 'csv' : 'xlsx'}`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Exportación exitosa', `El archivo ${format.toUpperCase()} se descargó correctamente`)
    } catch (error: any) {
      console.error('Error al exportar:', error)
      toast.error('Error al exportar', error.message || 'Ocurrió un error al generar el archivo')
    } finally {
      setIsExporting(false)
    }
  }

  // Helpers visuales
  const getAccionIcon = (accion: string) => {
    switch (accion) {
      case 'crear': return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'actualizar': return <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'eliminar': return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'login': return <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'logout': return <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getAccionColor = (accion: string) => {
    const colors: Record<string, string> = {
      crear: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      actualizar: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      eliminar: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
      login: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
      logout: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    }
    return colors[accion] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  // Lógica inteligente para resumen de cambios
  const getResumenCambios = (log: AuditoriaLog) => {
    if (log.accion === 'crear' && log.datos_nuevos) {
      const nombre = log.datos_nuevos.nombre || log.datos_nuevos.titulo || log.datos_nuevos.email || 'Registro'
      return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Creado: {String(nombre)}</span>
    }
    if (log.accion === 'eliminar' && log.datos_anteriores) {
      const nombre = log.datos_anteriores.nombre || log.datos_anteriores.titulo || log.datos_anteriores.email || 'Registro'
      return <span className="text-red-600 dark:text-red-400 font-medium">Eliminado: {String(nombre)}</span>
    }
    if (log.accion === 'actualizar' && log.datos_anteriores && log.datos_nuevos) {
      // Buscar el primer campo que cambió (ej: nombre, estado)
      const keys = Object.keys(log.datos_nuevos)
      for (const key of keys) {
        if (log.datos_anteriores[key] !== log.datos_nuevos[key] && key !== 'actualizado_en') {
          const oldVal = String(log.datos_anteriores[key] ?? 'null').substring(0, 15)
          const newVal = String(log.datos_nuevos[key] ?? 'null').substring(0, 15)
          return (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {key}: {oldVal} → {newVal}
            </span>
          )
        }
      }
      return <span className="text-blue-600 dark:text-blue-400">Datos actualizados</span>
    }
    return <span className="text-gray-500 dark:text-gray-400">Sin detalles</span>
  }

  const columns = [
    {
      accessorKey: 'creado_en',
      header: 'Fecha/Hora',
      cell: ({ row }: any) => (
        <div className="text-sm flex items-center gap-1 text-gray-900 dark:text-gray-100">
          <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          {new Date(row.getValue('creado_en')).toLocaleString('es-BO', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          })}
        </div>
      ),
    },
    {
      accessorKey: 'accion',
      header: 'Acción',
      cell: ({ row }: any) => {
        const accion = row.getValue('accion') as string
        return (
          <Badge variant="outline" className={getAccionColor(accion)}>
            <div className="flex items-center gap-1">
              {getAccionIcon(accion)}
              <span className="capitalize">{accion}</span>
            </div>
          </Badge>
        )
      },
    },
    {
      accessorKey: 'usuario',
      header: 'Usuario',
      cell: ({ row }: any) => {
        const usuario = row.original.usuario
        if (!usuario) {
          return (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <User className="h-3 w-3" /> Sistema
            </div>
          )
        }
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white">{usuario.nombre_completo}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{usuario.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'tabla_afectada',
      header: 'Tabla',
      cell: ({ row }: any) => (
        <div className="text-sm font-mono text-gray-900 dark:text-gray-100 flex items-center gap-1">
          <Database className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          {row.getValue('tabla_afectada')}
        </div>
      ),
    },
    {
      id: 'cambios',
      header: 'Resumen de Cambios',
      cell: ({ row }: any) => (
        <div className="text-xs max-w-xs truncate">
          {getResumenCambios(row.original)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.original)}
          className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span className="sr-only">Ver detalles</span>
        </Button>
      ),
    },
  ]

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría del Sistema"
        description="Historial completo de acciones y cambios en el sistema"
      />

      {/* Filtros */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Filtros</h3>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Usuario</Label>
            <Select value={usuarioFilter} onValueChange={(v) => handleFilterChange('usuario_id', v)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {usuarios.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.nombre_completo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Acción</Label>
            <Select value={accionFilter} onValueChange={(v) => handleFilterChange('accion', v)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Todas las acciones" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="all">Todas las acciones</SelectItem>
                {acciones.map((accion) => (
                  <SelectItem key={accion} value={accion}>{accion.charAt(0).toUpperCase() + accion.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Tabla</Label>
            <Select value={tablaFilter} onValueChange={(v) => handleFilterChange('tabla', v)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Todas las tablas" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="all">Todas las tablas</SelectItem>
                {tablas.map((tabla) => (
                  <SelectItem key={tabla} value={tabla}>{tabla}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Fecha Inicio</Label>
            <Input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Fecha Fin</Label>
            <Input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Stats y Exportación */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usuarios.length}</p>
            </div>
            <User className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tablas Afectadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tablas.length}</p>
            </div>
            <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Acciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{acciones.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Botón de Exportación */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Registros'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-600">
            <DropdownMenuItem onClick={() => handleExport('csv')} className="dark:text-gray-200 dark:focus:bg-gray-700">
              <FileText className="h-4 w-4 mr-2" />
              Exportar como CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')} className="dark:text-gray-200 dark:focus:bg-gray-700">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar como Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={logs}
        searchKey="tabla_afectada"
        searchPlaceholder="Buscar por tabla..."
        isLoading={isLoading}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Sheet de Detalles */}
      <AuditoriaDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        log={selectedLog}
      />
    </div>
  )
}