import { Button } from '@/components/ui/button'
import { FolderOpen, Inbox, Package, Search, Users } from 'lucide-react'

type EmptyStateVariant = 'general' | 'search' | 'folder' | 'users' | 'products'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: EmptyStateVariant
  className?: string
}

const defaultIcons: Record<EmptyStateVariant, React.ReactNode> = {
  general: <Inbox className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  folder: <FolderOpen className="h-12 w-12" />,
  users: <Users className="h-12 w-12" />,
  products: <Package className="h-12 w-12" />,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'general',
  className = '',
}: EmptyStateProps) {
  const displayIcon = icon || defaultIcons[variant]

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icono */}
      <div className="mb-6 rounded-full bg-gray-100 p-6 bg-gray-800">
        <div className="text-gray-400 dark:text-gray-300">
          {displayIcon}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Descripción */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-300 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Botón de acción */}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}