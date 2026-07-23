import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    // Nota: El componente padre es responsable de cerrar el diálogo (onOpenChange(false)) 
    // después de que la promesa se resuelva exitosamente.
  }

  const isDestructive = variant === 'destructive'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-800 dark:border-gray-600">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
              isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {isDestructive ? (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <AlertDialogTitle className={isDestructive ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            disabled={isLoading}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={isDestructive ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isLoading}
              className={isDestructive ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700' : ''}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}