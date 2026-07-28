export interface TipoSeccion {
  id: number
  nombre: string
  slug: string
  descripcion?: string | null
  campos_metadata: string[]
  icono?: string | null
  orden: number
  estado: 'activo' | 'inactivo' | 'eliminado'
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
}

export interface CreateTipoSeccionDTO {
  nombre: string
  slug: string
  descripcion?: string
  campos_metadata: string[]
  icono?: string
  orden?: number
  estado?: 'activo' | 'inactivo'
}

export interface UpdateTipoSeccionDTO {
  id: number
  nombre?: string
  slug?: string
  descripcion?: string
  campos_metadata?: string[]
  icono?: string
  orden?: number
  estado?: 'activo' | 'inactivo' | 'eliminado'
}