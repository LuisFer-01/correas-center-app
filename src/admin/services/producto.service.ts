import type { CreateProductoDTO, Producto, ProductoMarcaDTO, UpdateProductoDTO } from '@/admin/types/producto'
import { supabase } from '@/lib/supabase'

export async function getProductos(includeDeleted: boolean = false): Promise<Producto[]> {
  let query = supabase
    .from('productos')
    .select(`*, empresa:empresas(id, nombre), producto_marca( marca:marcas(id, nombre, slug), orden, estado )`)
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('orden', { ascending: true }).order('nombre', { ascending: true })
  
  const { data, error } = await query
  if (error) throw error
  
  return (data || []).map((p: any) => ({
    ...p,
    estado: p.estado || 'activo',
    // Mapeamos las marcas incluyendo orden y estado
    marcas: p.producto_marca?.map((pm: any) => ({
      ...pm.marca,
      orden: pm.orden,
      estado: pm.estado || 'activo'
    })).filter(Boolean) || [],
  }))
}

export async function getMarcasActivas() {
  const { data, error } = await supabase
    .from('marcas')
    .select('id, nombre, slug')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getNextOrden(): Promise<number> {
  const { data, error } = await supabase
    .from('productos')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error || !data) return 1
  return (data.orden || 0) + 1
}

export async function getEmpresasActivas() {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, nombre')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data || []
}

async function generarSlugUnico(slugBase: string, excludeId?: number): Promise<string> {
  let slug = slugBase
  let contador = 1
  
  while (true) {
    let query = supabase
      .from('productos')
      .select('id')
      .eq('slug', slug)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data } = await query.maybeSingle()
    if (!data) return slug
    
    slug = `${slugBase}-${contador}`
    contador++
  }
}

export async function crearProducto(dto: CreateProductoDTO) {
  const slugFinal = await generarSlugUnico(dto.slug)
  
  const { data: productoData, error: productoError } = await supabase
    .from('productos')
    .insert({
      empresa_id: dto.empresa_id,
      nombre: dto.nombre,
      slug: slugFinal,
      imagen: dto.imagen,
      orden: dto.orden ?? 0,
      estado: dto.estado || 'activo',
    })
    .select()
    .single()
  
  if (productoError) throw new Error(productoError.message)
  return productoData
}

export async function actualizarProducto(dto: UpdateProductoDTO) {
  const updateData: any = {}
  if (dto.empresa_id !== undefined) updateData.empresa_id = dto.empresa_id
  if (dto.nombre !== undefined) updateData.nombre = dto.nombre
  
  if (dto.slug !== undefined) {
    const { data: existe } = await supabase.from('productos').select('id').eq('slug', dto.slug).neq('id', dto.id).maybeSingle()
    if (existe) throw new Error(`El slug "${dto.slug}" ya está en uso`)
    updateData.slug = dto.slug
  }
  
  if (dto.imagen !== undefined) updateData.imagen = dto.imagen
  if (dto.orden !== undefined) updateData.orden = dto.orden
  
  if (dto.estado !== undefined) {
    updateData.estado = dto.estado
    updateData.eliminado_en = dto.estado === 'eliminado' ? new Date().toISOString() : null
  }

  const { data: productoData, error: productoError } = await supabase
    .from('productos')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (productoError) throw new Error(productoError.message)
  return productoData
}

// ✅ NUEVA FUNCIÓN: Actualizar marcas asociadas desde el modal
export async function actualizarMarcasProducto(productoId: number, marcasData: ProductoMarcaDTO[]) {
  // Usamos upsert para actualizar o insertar, manejando tanto 'activo' como 'inactivo'
  const dataToUpsert = marcasData.map(m => ({
    producto_id: productoId,
    marca_id: m.marca_id,
    orden: m.orden,
    estado: m.estado
  }))

  const { error } = await supabase
    .from('producto_marca')
    .upsert(dataToUpsert, { onConflict: 'producto_id,marca_id' })
  
  if (error) throw new Error(error.message)
}

export async function eliminarProducto(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabase.from('productos').update({ estado: 'eliminado', eliminado_en: now }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function restaurarProducto(id: number) {
  const { error } = await supabase
    .from('productos')
    .update({ estado: 'activo', eliminado_en: null })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}