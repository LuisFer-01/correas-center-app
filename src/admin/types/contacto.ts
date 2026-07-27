export type EstadoContacto = 'nuevo' | 'leido' | 'respondido' | 'archivado'

export interface Contacto {
  id: number
  empresa_id: number
  nombre: string
  empresa?: string | null
  telefono: string
  email: string
  mensaje: string
  estado: EstadoContacto
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
  empresa_rel?: { id: number; nombre: string }
}

export interface ContactoStats {
  nuevos: number
  leidos: number
  respondidos: number
  archivados: number
  total: number
}

export interface UpdateContactoDTO {
  id: number
  estado?: EstadoContacto
  eliminado_en?: string | null
}