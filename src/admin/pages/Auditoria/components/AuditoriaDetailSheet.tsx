import type { AuditoriaLog } from '@/admin/types/auditoria'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { CheckCircle2, X } from 'lucide-react'

interface AuditoriaDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditoriaLog | null
}

export function AuditoriaDetailSheet({ open, onOpenChange, log }: AuditoriaDetailSheetProps) {
  if (!log) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto bg-white dark:bg-gray-900 border-l dark:border-gray-700">
        <SheetHeader>
          <SheetTitle className="dark:text-white flex items-center gap-2">
            Detalle del Log #{log.id}
          </SheetTitle>
          <SheetDescription className="dark:text-gray-400">
            Información completa de la acción registrada en el sistema
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información Básica */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Información Básica</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Acción:</span>
                <Badge variant="outline" className="ml-2 capitalize dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                  {log.accion}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Tabla:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">{log.tabla_afectada}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Registro ID:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">{log.registro_id || '—'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {new Date(log.creado_en).toLocaleString('es-BO')}
                </span>
              </div>
            </div>
          </div>

          {/* Usuario */}
          {log.usuario && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Usuario</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{log.usuario.nombre_completo}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{log.usuario.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Conexión */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Información de Conexión</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">IP:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-gray-100">{log.ip_address || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">User Agent:</span>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-2 rounded-md font-mono">
                  {log.user_agent || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Datos Anteriores */}
          {log.datos_anteriores && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-2">
                <X className="h-4 w-4" />
                Datos Anteriores
              </h4>
              <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
                {JSON.stringify(log.datos_anteriores, null, 2)}
              </pre>
            </div>
          )}

          {/* Datos Nuevos */}
          {log.datos_nuevos && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Datos Nuevos
              </h4>
              <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
                {JSON.stringify(log.datos_nuevos, null, 2)}
              </pre>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Metadata Adicional</h4>
              <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}