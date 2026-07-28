export interface TipoAtributo {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  icono: string | null
  permite_descripcion: boolean
  permite_valor_numerico: boolean
  permite_unidad_medida: boolean
  orden: number
  estado: 'activo' | 'inactivo' | 'eliminado'
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
}

export interface CreateTipoAtributoDTO {
  nombre: string
  slug: string
  descripcion?: string
  icono?: string
  permite_descripcion?: boolean
  permite_valor_numerico?: boolean
  permite_unidad_medida?: boolean
  orden?: number
  estado?: 'activo' | 'inactivo'
}

export interface UpdateTipoAtributoDTO {
  id: number
  nombre?: string
  slug?: string
  descripcion?: string
  icono?: string
  permite_descripcion?: boolean
  permite_valor_numerico?: boolean
  permite_unidad_medida?: boolean
  orden?: number
  estado?: 'activo' | 'inactivo' | 'eliminado'
}