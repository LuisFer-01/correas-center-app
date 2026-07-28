import type { Contacto, EstadoContacto } from '@/admin/types/contacto'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Archive,
  ArchiveRestore,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  X,
} from 'lucide-react'

interface ContactoDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacto: Contacto | null
  onMarcarLeido: (id: number) => Promise<void>
  onMarcarRespondido: (id: number) => Promise<void>
  onArchivar: (id: number) => Promise<void>
  onDesarchivar: (id: number) => Promise<void> // ✅ NUEVO
}

export function ContactoDetailModal({
  open,
  onOpenChange,
  contacto,
  onMarcarLeido,
  onMarcarRespondido,
  onArchivar,
  onDesarchivar, // ✅ NUEVO
}: ContactoDetailModalProps) {
  if (!contacto) return null

  const getEstadoColor = (estado: EstadoContacto) => {
    const colors = {
      nuevo: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      leido: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
      respondido: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
      archivado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    }
    return colors[estado] || colors.nuevo
  }

  const getEstadoLabel = (estado: EstadoContacto) => {
    const labels = {
      nuevo: 'Nuevo',
      leido: 'Leído',
      respondido: 'Respondido',
      archivado: 'Archivado',
    }
    return labels[estado] || estado
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ FIX: max-h-[90vh] overflow-y-auto para evitar desbordamiento vertical */}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#EA0A2A] flex-shrink-0" />
                Detalle del Contacto
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-1">
                Información completa del mensaje recibido
              </DialogDescription>
            </div>
            {/* ✅ FIX: Badge no se desborda con flex-shrink-0 */}
            <Badge className={`${getEstadoColor(contacto.estado)} flex-shrink-0`}>
              {getEstadoLabel(contacto.estado)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del Contacto */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  Empresa
                </label>
                <p className="text-sm font-medium text-white break-words">
                  {contacto.empresa_rel?.nombre || contacto.empresa || '—'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  Fecha de Recepción
                </label>
                <p className="text-sm font-medium text-white">
                  {new Date(contacto.creado_en).toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  Correo Electrónico
                </label>
                {/* ✅ FIX: break-words en lugar de break-all para mejor lectura */}
                <p className="text-sm text-white break-words">
                  {contacto.email}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  Teléfono
                </label>
                <p className="text-sm text-white break-words">
                  {contacto.telefono}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                Mensaje
              </label>
              {/* ✅ FIX: max-h-48 overflow-y-auto para mensajes largos */}
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap break-words">
                  {contacto.mensaje}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIX: flex-wrap para que los botones se adapten al ancho */}
        <DialogFooter className="flex-col sm:flex-row gap-2 flex-wrap">
          {contacto.estado === 'nuevo' && (
            <Button
              onClick={() => onMarcarLeido(contacto.id)}
              variant="outline"
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Marcar como Leído
            </Button>
          )}
          {contacto.estado !== 'respondido' && contacto.estado !== 'archivado' && (
            <Button
              onClick={() => onMarcarRespondido(contacto.id)}
              variant="outline"
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar como Respondido
            </Button>
          )}
          {contacto.estado !== 'archivado' && (
            <Button
              onClick={() => onArchivar(contacto.id)}
              variant="outline"
              className="bg-red-900/30 text-red-400 border-red-700 hover:bg-red-900/50 hover:text-red-300"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </Button>
          )}
          {/* ✅ NUEVO: Botón Desarchivar solo si está archivado */}
          {contacto.estado === 'archivado' && (
            <Button
              onClick={() => onDesarchivar(contacto.id)}
              variant="outline"
              className="bg-emerald-900/30 text-emerald-400 border-emerald-700 hover:bg-emerald-900/50 hover:text-emerald-300"
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Desarchivar
            </Button>
          )}
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}