import { RequirePermission } from '@/admin/components/shared/RequirePermission'
import { toast } from '@/admin/components/shared/Toast'
import {
    archivarContacto,
    marcarComoLeido,
    marcarComoRespondido,
} from '@/admin/services/contacto.service'
import type { Contacto, EstadoContacto } from '@/admin/types/contacto'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Archive,
    Building2,
    CheckCircle2,
    Eye,
    Mail,
    MessageSquare,
    Phone,
    User
} from 'lucide-react'

interface ContactoDetalleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacto: Contacto | null
  onSuccess: () => void
}

const estadoConfig: Record<EstadoContacto, { label: string; className: string }> = {
  nuevo: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  leido: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  respondido: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  archivado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
}

const estadoLabels: Record<EstadoContacto, string> = {
  nuevo: 'Nuevo',
  leido: 'Leído',
  respondido: 'Respondido',
  archivado: 'Archivado',
}

export function ContactoDetalleModal({
  open,
  onOpenChange,
  contacto,
  onSuccess,
}: ContactoDetalleModalProps) {
  if (!contacto) return null

  const handleCambiarEstado = async (nuevoEstado: EstadoContacto) => {
    try {
      if (nuevoEstado === 'leido') {
        await marcarComoLeido(contacto.id)
        toast.success('Estado actualizado', 'El contacto se marcó como leído')
      } else if (nuevoEstado === 'respondido') {
        await marcarComoRespondido(contacto.id)
        toast.success('Estado actualizado', 'El contacto se marcó como respondido')
      } else if (nuevoEstado === 'archivado') {
        await archivarContacto(contacto.id)
        toast.success('Contacto archivado', 'El contacto se archivó correctamente')
      }
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo actualizar el estado')
    }
  }

  const fechaFormateada = new Date(contacto.creado_en).toLocaleString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333] dark:border-gray-600">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#EA0A2A]" />
              Detalle del Contacto
            </DialogTitle>
            <Badge
              variant="outline"
              className={estadoConfig[contacto.estado]}
            >
              {estadoLabels[contacto.estado]}
            </Badge>
          </div>
          <DialogDescription className="dark:text-gray-300">
            Recibido el {fechaFormateada}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Información del Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
              <User className="h-5 w-5 text-[#EA0A2A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {contacto.nombre}
                </p>
              </div>
            </div>

            {contacto.empresa && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
                <Building2 className="h-5 w-5 text-[#EA0A2A] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Empresa</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {contacto.empresa}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
              <Mail className="h-5 w-5 text-[#EA0A2A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <a
                  href={`mailto:${contacto.email}`}
                  className="text-sm font-medium text-[#EA0A2A] hover:underline truncate block"
                >
                  {contacto.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
              <Phone className="h-5 w-5 text-[#EA0A2A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                <a
                  href={`tel:${contacto.telefono}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#EA0A2A] truncate block"
                >
                  {contacto.telefono}
                </a>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-[#EA0A2A]" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Mensaje</p>
            </div>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {contacto.mensaje}
            </p>
          </div>

          {/* Acciones de Estado */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-3">
              Cambiar estado del contacto:
            </p>
            <div className="flex flex-wrap gap-2">
              {contacto.estado !== 'leido' && (
                <RequirePermission permission="contactos.update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCambiarEstado('leido')}
                    className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/30"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Marcar como Leído
                  </Button>
                </RequirePermission>
              )}

              {contacto.estado !== 'respondido' && (
                <RequirePermission permission="contactos.update">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCambiarEstado('respondido')}
                    className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Respondido
                  </Button>
                </RequirePermission>
              )}

              {contacto.estado !== 'archivado' && (
                <RequirePermission permission="contactos.delete">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCambiarEstado('archivado')}
                    className="bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </Button>
                </RequirePermission>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}