import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface FormShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: () => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  className?: string
}

export function FormShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  className,
}: FormShellProps) {
  // Prevenir cierre accidental cuando está cargando
  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading) return
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`sm:max-w-[600px] bg-gray-800 dark:border-gray-600 ${className || ''}`}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}