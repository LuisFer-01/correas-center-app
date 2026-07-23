import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Configuración de iconos por tipo
const toastConfig: Record<ToastType, { icon: React.ReactNode }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
}

/**
 * Helper principal para mostrar toasts
 */
export function showToast(type: ToastType, options: ToastOptions) {
  const config = toastConfig[type]

  sonnerToast(options.title, {
    description: options.description,
    duration: options.duration || 4000,
    icon: config.icon,
    action: options.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
    className: 'dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333] dark:border-gray-600 dark:text-white',
  })
}

// Atajos para cada tipo
export const toast = {
  success: (title: string, description?: string) =>
    showToast('success', { title, description }),

  error: (title: string, description?: string) =>
    showToast('error', { title, description, duration: 6000 }),

  warning: (title: string, description?: string) =>
    showToast('warning', { title, description }),

  info: (title: string, description?: string) =>
    showToast('info', { title, description }),

  promise: function <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) {
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      className: 'dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333] dark:border-gray-600 dark:text-white',
    })
    return promise
  },
}