import { Button } from '@/components/ui/button'
import { AlertCircle, Database, RefreshCw, WifiOff } from 'lucide-react'

type ErrorVariant = 'general' | 'network' | 'database'

interface ErrorStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  onRetry?: () => void
  variant?: ErrorVariant
  className?: string
}

const defaultConfig: Record<ErrorVariant, { icon: React.ReactNode; title: string; description: string }> = {
  general: {
    icon: <AlertCircle className="h-12 w-12" />,
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
  },
  network: {
    icon: <WifiOff className="h-12 w-12" />,
    title: 'Error de conexión',
    description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  },
  database: {
    icon: <Database className="h-12 w-12" />,
    title: 'Error de base de datos',
    description: 'No se pudieron cargar los datos. El servidor puede estar experimentando problemas.',
  },
}

export function ErrorState({
  icon,
  title,
  description,
  onRetry,
  variant = 'general',
  className = '',
}: ErrorStateProps) {
  const config = defaultConfig[variant]
  const displayIcon = icon || config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icono */}
      <div className="mb-6 rounded-full bg-red-50 p-6 bg-gray-800">
        <div className="text-red-500 dark:text-red-400">
          {displayIcon}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-gray-500 dark:text-gray-300 max-w-md mb-6">
        {displayDescription}
      </p>

      {/* Botón de reintentar */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  )
}