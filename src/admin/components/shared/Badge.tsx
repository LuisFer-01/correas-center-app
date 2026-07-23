import { Badge as ShadcnBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'brand'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#EA0A2A] text-white hover:bg-[#c90825]',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200',
  destructive: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300',
  success: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  brand: 'bg-[#EA0A2A]/10 text-[#EA0A2A] hover:bg-[#EA0A2A]/20 dark:bg-[#EA0A2A]/20',
}

export function Badge({
  variant = 'default',
  icon,
  dot,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge
      variant={
        variant === 'default' || variant === 'secondary' || variant === 'destructive' || variant === 'outline'
          ? variant
          : 'secondary'
      }
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'destructive' && 'bg-red-500',
            variant === 'brand' && 'bg-[#EA0A2A]',
            variant === 'default' && 'bg-white',
            variant === 'secondary' && 'bg-gray-500 dark:bg-gray-400'
          )}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </ShadcnBadge>
  )
}