import { supabase } from '@/lib/supabase'

export interface SearchResult {
  productos: Array<{
    id: number
    nombre: string
    slug: string
    imagen: string | null
  }>
  categorias: Array<{
    id: number
    nombre: string
    slug: string
    descripcion_corta: string | null
    producto: {
      id: number
      nombre: string
      slug: string
    } | null
  }>
  total: number
}

export const searchService = {
  async search(query: string): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
      return { productos: [], categorias: [], total: 0 }
    }

    const searchTerm = `%${query.trim()}%`

    // Buscar productos por nombre
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre, slug, imagen')
      .ilike('nombre', searchTerm)
      .eq('estado', 'activo')
      .order('nombre', { ascending: true })
      .limit(20)

    // Buscar categorías por nombre (con relación a producto)
    const { data: categoriasData } = await supabase
      .from('categorias')
      .select('id, nombre, slug, descripcion_corta, producto:productos(id, nombre, slug)')
      .ilike('nombre', searchTerm)
      .eq('estado', 'activo')
      .order('nombre', { ascending: true })
      .limit(20)

    const productos = productosData || []
    const categorias = categoriasData || []

    return {
      productos,
      categorias,
      total: productos.length + categorias.length,
    }
  },
}