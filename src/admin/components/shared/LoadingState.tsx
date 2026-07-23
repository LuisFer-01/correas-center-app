import { Skeleton } from '@/components/ui/skeleton'

type LoadingVariant = 'general' | 'table' | 'cards' | 'form' | 'stats'

interface LoadingStateProps {
  variant?: LoadingVariant
  rows?: number
  columns?: number
  className?: string
}

export function LoadingState({
  variant = 'general',
  rows = 5,
  columns = 4,
  className = '',
}: LoadingStateProps) {
  // Loading general (spinner simple)
  if (variant === 'general') {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#EA0A2A] border-r-transparent mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  // Loading de tabla
  if (variant === 'table') {
    return (
      <div className={`rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333] ${className}`}>
        {/* Header de la tabla */}
        <div className="border-b border-gray-200 dark:border-gray-600 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1 dark:bg-gray-600" />
            ))}
          </div>
        </div>
        {/* Filas de la tabla */}
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1 dark:bg-gray-600" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Loading de cards (grid)
  if (variant === 'cards') {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-600 p-6 dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333]"
          >
            <Skeleton className="h-4 w-1/2 mb-4 dark:bg-gray-600" />
            <Skeleton className="h-8 w-1/3 mb-2 dark:bg-gray-600" />
            <Skeleton className="h-3 w-2/3 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    )
  }

  // Loading de formulario
  if (variant === 'form') {
    return (
      <div className={`space-y-4 max-w-2xl ${className}`}>
        <Skeleton className="h-6 w-1/3 dark:bg-gray-600" />
        <Skeleton className="h-10 w-full dark:bg-gray-600" />
        <Skeleton className="h-6 w-1/4 dark:bg-gray-600" />
        <Skeleton className="h-10 w-full dark:bg-gray-600" />
        <Skeleton className="h-6 w-1/5 dark:bg-gray-600" />
        <Skeleton className="h-24 w-full dark:bg-gray-600" />
        <Skeleton className="h-10 w-32 dark:bg-gray-600" />
      </div>
    )
  }

  // Loading de estadísticas (stats cards)
  if (variant === 'stats') {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-600 p-6 dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333]"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-1/2 dark:bg-gray-600" />
              <Skeleton className="h-8 w-8 rounded-lg dark:bg-gray-600" />
            </div>
            <Skeleton className="h-8 w-1/3 mb-2 dark:bg-gray-600" />
            <Skeleton className="h-3 w-2/3 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    )
  }

  return null
}