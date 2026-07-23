import { Badge } from '@/components/ui/badge'
import { Archive, CheckCircle2, Clock, XCircle } from 'lucide-react'

type StatusType = 'activo' | 'inactivo' | 'eliminado' | 'nuevo' | 'pendiente'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<
  StatusType,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    className: string
  }
> = {
  activo: {
    label: 'Activo',
    icon: CheckCircle2,
    className:
      'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  },
  inactivo: {
    label: 'Inactivo',
    icon: XCircle,
    className:
      'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  },
  eliminado: {
    label: 'Eliminado',
    icon: Archive,
    className:
      'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  },
  nuevo: {
    label: 'Nuevo',
    icon: Clock,
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  },
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium border ${config.className} ${className || ''}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}