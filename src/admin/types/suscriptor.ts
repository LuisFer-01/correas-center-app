export type EstadoSuscriptor = 'activo' | 'inactivo' | 'eliminado'

export interface Suscriptor {
  id: number
  email: string
  nombre?: string | null
  estado: EstadoSuscriptor
  email_verificado_en?: string | null
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
  empresa_id: number
  empresa?: { id: number; nombre: string }
}

export interface SuscriptorStats {
  activos: number
  inactivos: number
  verificados: number
  noVerificados: number
  total: number
}