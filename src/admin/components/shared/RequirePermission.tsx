import { usePermissions } from '@/hooks/usePermissions'
import { Loader2 } from 'lucide-react'

interface RequirePermissionProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoading?: boolean
}

export function RequirePermission({
  permission,
  children,
  fallback = null,
  showLoading = false,
}: RequirePermissionProps) {
  const { hasPermission, loading } = usePermissions()

  // Mientras carga los permisos
  if (loading) {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
        </div>
      )
    }
    return null
  }

  // Si no tiene el permiso requerido
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Si tiene el permiso, renderizar children
  return <>{children}</>
}

// Helper para verificar múltiples permisos (OR)
interface RequireAnyPermissionProps {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireAnyPermission({
  permissions,
  children,
  fallback = null,
}: RequireAnyPermissionProps) {
  const { hasAnyPermission, loading } = usePermissions()

  if (loading) return null
  if (!hasAnyPermission(permissions)) return <>{fallback}</>

  return <>{children}</>
}

// Helper para verificar múltiples permisos (AND - todos requeridos)
interface RequireAllPermissionsProps {
  permissions: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireAllPermissions({
  permissions,
  children,
  fallback = null,
}: RequireAllPermissionsProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) return null

  const hasAll = permissions.every((p) => hasPermission(p))
  if (!hasAll) return <>{fallback}</>

  return <>{children}</>
}