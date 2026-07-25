import { ConfirmDialog } from '@/admin/components/shared/ConfirmDialog'
import { StatusBadge } from '@/admin/components/shared/StatusBadge'
import { toast } from '@/admin/components/shared/Toast'
import {
    eliminarRegistroContenido,
    getContenidosByRegistroId
} from '@/admin/services/registro.service'
import type { Registro, RegistroContenido } from '@/admin/types/registro'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RegistroContenidoForm } from './RegistroContenidoForm'

interface RegistroContenidoManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registro: Registro | null
  onSuccess: () => void
}

// Mapeo de iconos de Lucide
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle2: CheckCircle2,
  Award: () => <CheckCircle2 className="h-4 w-4" />,
  Star: () => <CheckCircle2 className="h-4 w-4" />,
  Target: () => <CheckCircle2 className="h-4 w-4" />,
}

export function RegistroContenidoManager({ open, onOpenChange, registro, onSuccess }: RegistroContenidoManagerProps) {
  const [contenidos, setContenidos] = useState<RegistroContenido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [contenidoEditar, setContenidoEditar] = useState<RegistroContenido | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [contenidoEliminar, setContenidoEliminar] = useState<RegistroContenido | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadContenidos = async () => {
    if (!registro) return
    setIsLoading(true)
    try {
      const data = await getContenidosByRegistroId(registro.id)
      setContenidos(data)
    } catch (error) {
      console.error('Error al cargar contenidos:', error)
      toast.error('Error al cargar', 'No se pudieron obtener los contenidos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && registro) {
      loadContenidos()
    }
  }, [open, registro])

  const handleAdd = () => {
    setContenidoEditar(null)
    setIsFormOpen(true)
  }

  const handleEdit = (contenido: RegistroContenido) => {
    setContenidoEditar(contenido)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (contenido: RegistroContenido) => {
    setContenidoEliminar(contenido)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contenidoEliminar) return
    setIsDeleting(true)
    try {
      await eliminarRegistroContenido(contenidoEliminar.id)
      toast.success('Contenido eliminado', 'Se marcó como eliminado correctamente')
      setIsDeleteOpen(false)
      setContenidoEliminar(null)
      await loadContenidos()
      onSuccess()
    } catch (error: any) {
      toast.error('Error', error.message || 'No se pudo eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setContenidoEditar(null)
    loadContenidos()
    onSuccess()
  }

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return <Circle className="h-4 w-4 text-gray-400" />
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className="h-4 w-4 text-[#EA0A2A]" /> : <Circle className="h-4 w-4 text-gray-400" />
  }

  if (!registro) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] dark:bg-gray-800 dark:border-gray-600">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Gestionar Contenidos</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Registro: <span className="font-semibold text-[#EA0A2A]">{registro.nombre}</span> ({registro.identificador})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Contenidos asignados ({contenidos.length})
              </h3>
              <Button onClick={handleAdd} size="sm" className="bg-[#EA0A2A] hover:bg-[#c90825]">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Contenido
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Cargando contenidos...
              </div>
            ) : contenidos.length > 0 ? (
              <div className="border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800/50 max-h-[400px] overflow-y-auto">
                <div className="divide-y dark:divide-gray-600">
                  {contenidos.map((contenido) => (
                    <div key={contenido.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconComponent(contenido.icono)}
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {contenido.titulo || 'Sin título'}
                          </p>
                          {contenido.subtitulo && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              - {contenido.subtitulo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {contenido.stats && (
                            <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                              {contenido.stats}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            Orden: {contenido.orden}
                          </Badge>
                          <StatusBadge status={contenido.estado} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-600" 
                          onClick={() => handleEdit(contenido)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(contenido)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay contenidos asignados a este registro.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isFormOpen && (
        <RegistroContenidoForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          registroId={registro.id}
          contenidoEditar={contenidoEditar}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este contenido?"
        description={`Se marcará como eliminado el contenido "${contenidoEliminar?.titulo || 'sin título'}".`}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  )
}