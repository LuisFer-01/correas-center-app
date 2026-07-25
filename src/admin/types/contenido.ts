export interface TipoSeccionResumen {
  id: number
  nombre: string
  slug: string
}

export interface ContenidoSeccion {
  id: number
  empresa_id: number
  tipo_seccion_id: number
  titulo?: string | null
  subtitulo?: string | null
  descripcion?: string | null
  icono?: string | null
  imagen?: string | null
  metadata: Record<string, any>
  orden: number
  mostrar: boolean
  estado: 'activo' | 'inactivo' | 'eliminado'
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
  empresa?: { id: number; nombre: string }
  tipo_seccion?: TipoSeccionResumen
}

export interface CreateContenidoDTO {
  empresa_id: number
  tipo_seccion_id: number
  titulo?: string
  subtitulo?: string
  descripcion?: string
  icono?: string
  imagen?: string
  metadata?: Record<string, any>
  orden?: number
  mostrar?: boolean
  estado?: 'activo' | 'inactivo'
}

export interface UpdateContenidoDTO {
  id: number
  empresa_id?: number
  tipo_seccion_id?: number
  titulo?: string
  subtitulo?: string
  descripcion?: string
  icono?: string
  imagen?: string
  metadata?: Record<string, any>
  orden?: number
  mostrar?: boolean
  estado?: 'activo' | 'inactivo' | 'eliminado'
}