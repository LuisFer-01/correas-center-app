import { CheckboxField } from '@/admin/components/shared/CheckboxField'
import { toast } from '@/admin/components/shared/Toast'
import { actualizarPermisosRol, traducirGrupo } from '@/admin/services/rol.service'
import type { PermisosAgrupados, Rol } from '@/admin/types/rol'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Shield, UserRoundKey } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RolPermisosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rol: Rol | null
  permisosAgrupados: PermisosAgrupados
  onSuccess: () => void
}

export function RolPermisosModal({
  open,
  onOpenChange,
  rol,
  permisosAgrupados,
  onSuccess,
}: RolPermisosModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [permisoIds, setPermisoIds] = useState<number[]>([])
  const [busqueda, setBusqueda] = useState('')

  // Cargar permisos actuales del rol
  useEffect(() => {
    if (rol && open) {
      setPermisoIds(rol.permisos.map((p) => p.id))
      setBusqueda('')
    }
  }, [rol, open])

  const toggleGrupo = (grupo: string) => {
    const permisosDelGrupo = permisosAgrupados[grupo] || []
    const grupoIds = permisosDelGrupo.map((p) => p.id)
    const todosSeleccionados = grupoIds.every((id) => permisoIds.includes(id))
    
    if (todosSeleccionados) {
      setPermisoIds((prev) => prev.filter((id) => !grupoIds.includes(id)))
    } else {
      const nuevos = [...new Set([...permisoIds, ...grupoIds])]
      setPermisoIds(nuevos)
    }
  }

  const togglePermiso = (permisoId: number) => {
    setPermisoIds((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    )
  }

  const handleGuardar = async () => {
    if (!rol) return
    setIsLoading(true)
    try {
      await actualizarPermisosRol(rol.id, permisoIds)
      toast.success('Permisos actualizados', `Se actualizaron los permisos del rol "${rol.nombre}"`)
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al guardar', error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  if (!rol) return null

  // Filtrar permisos por búsqueda
  const permisosFiltrados = Object.entries(permisosAgrupados).reduce((acc, [grupo, permisos]) => {
    const filtrados = permisos.filter((p) => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      grupo.toLowerCase().includes(busqueda.toLowerCase())
    )
    if (filtrados.length > 0) {
      acc[grupo] = filtrados
    }
    return acc
  }, {} as PermisosAgrupados)

  const totalPermisos = Object.values(permisosAgrupados).flat().length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] dark:bg-gray-800 dark:border-gray-600">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA0A2A] text-white">
              <UserRoundKey className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="dark:text-white">
                Permisos del Rol
              </DialogTitle>
              <DialogDescription className="dark:text-gray-300">
                {rol.nombre} • <span className="font-mono text-xs">{rol.slug}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen */}
          <div className="flex items-center justify-between bg-white/5 dark:bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#EA0A2A]" />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Permisos seleccionados
              </span>
            </div>
            <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {permisoIds.length} / {totalPermisos}
            </Badge>
          </div>

          {/* Búsqueda */}
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar permisos..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 outline-none"
          />

          {/* Lista de permisos agrupados */}
          <ScrollArea className="h-[350px] rounded-md border border-gray-300 dark:border-gray-600 p-4 dark:bg-gray-800/50">
            {Object.keys(permisosFiltrados).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron permisos con "{busqueda}"
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(permisosFiltrados).map(([grupo, permisos]) => {
                  const grupoIds = permisos.map((p) => p.id)
                  const seleccionados = grupoIds.filter((id) => permisoIds.includes(id)).length
                  const todosSeleccionados = seleccionados === grupoIds.length && grupoIds.length > 0

                  return (
                    <div key={grupo} className="space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckboxField
                            label={traducirGrupo(grupo)}
                            name={`grupo-${grupo}`}
                            checked={todosSeleccionados}
                            onCheckedChange={() => toggleGrupo(grupo)}
                            description={`(${seleccionados}/${grupoIds.length})`}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                        {permisos.map((permiso) => (
                          <CheckboxField
                            key={permiso.id}
                            label={permiso.nombre}
                            name={`permiso-${permiso.id}`}
                            checked={permisoIds.includes(permiso.id)}
                            onCheckedChange={() => togglePermiso(permiso.id)}
                            description={permiso.descripcion || undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {rol.es_sistema && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Rol del sistema:</strong> Los permisos se pueden modificar, pero el rol no puede ser eliminado.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={isLoading}
            className="bg-[#EA0A2A] hover:bg-[#c90825] dark:bg-[#EA0A2A] dark:hover:bg-[#c90825]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserRoundKey className="mr-2 h-4 w-4" />
                Guardar Permisos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}