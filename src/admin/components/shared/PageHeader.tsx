import { AdminBreadcrumbs } from './AdminBreadcrumbs'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  showBreadcrumbs?: boolean
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  showBreadcrumbs = true,
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {showBreadcrumbs && <AdminBreadcrumbs />}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}