export interface MarcaResumen {
  id: number
  nombre: string
  slug: string
  orden: number | null
  estado: 'activo' | 'inactivo'
}

export interface Producto {
  id: number
  empresa_id: number
  nombre: string
  slug: string
  imagen?: string | null
  orden: number
  estado: 'activo' | 'inactivo' | 'eliminado'
  eliminado_en?: string | null
  creado_en: string
  actualizado_en: string
  empresa?: { id: number; nombre: string }
  marcas?: MarcaResumen[]
}

export interface CreateProductoDTO {
  empresa_id: number
  nombre: string
  slug: string
  imagen?: string
  orden?: number
  estado?: 'activo' | 'inactivo'
}

export interface UpdateProductoDTO {
  id: number
  empresa_id?: number
  nombre?: string
  slug?: string
  imagen?: string
  orden?: number
  estado?: 'activo' | 'inactivo' | 'eliminado'
}

// DTO para el modal de marcas
export interface ProductoMarcaDTO {
  marca_id: number
  orden: number | null
  estado: 'activo' | 'inactivo'
}