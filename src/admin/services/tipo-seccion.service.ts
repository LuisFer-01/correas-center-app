import type { CreateTipoSeccionDTO, TipoSeccion, UpdateTipoSeccionDTO } from '@/admin/types/tipo-seccion'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function getTiposSeccion(includeDeleted: boolean = false): Promise<TipoSeccion[]> {
  let query = supabase
    .from('tipo_seccion')
    .select('*')
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('orden', { ascending: true }).order('nombre', { ascending: true })
  
  const { data, error } = await query
  if (error) throw error
  
  return (data || []).map((t: any) => ({
    ...t,
    estado: t.estado || 'activo',
    campos_metadata: t.campos_metadata || [],
  }))
}

async function generarSlugUnico(slugBase: string, excludeId?: number): Promise<string> {
  let slug = slugBase
  let contador = 1
  
  while (true) {
    let query = supabase
      .from('tipo_seccion')
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

export async function getNextOrdenTipoSeccion(): Promise<number> {
  const { data, error } = await supabase
    .from('tipo_seccion')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error || !data) return 1
  return (data.orden || 0) + 1
}

export async function crearTipoSeccion(dto: CreateTipoSeccionDTO) {
  const slugFinal = await generarSlugUnico(dto.slug)
  
  const { data, error } = await supabaseAdmin
    .from('tipo_seccion')
    .insert({
      nombre: dto.nombre,
      slug: slugFinal,
      descripcion: dto.descripcion,
      campos_metadata: dto.campos_metadata,
      icono: dto.icono,
      orden: dto.orden ?? 0,
      estado: dto.estado || 'activo',
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarTipoSeccion(dto: UpdateTipoSeccionDTO) {
  const updateData: any = {}
  
  if (dto.nombre !== undefined) updateData.nombre = dto.nombre
  
  if (dto.slug !== undefined) {
    const { data: existe } = await supabase
      .from('tipo_seccion')
      .select('id')
      .eq('slug', dto.slug)
      .neq('id', dto.id)
      .maybeSingle()
    
    if (existe) {
      throw new Error(`El slug "${dto.slug}" ya está en uso por otro tipo de sección`)
    }
    updateData.slug = dto.slug
  }
  
  if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
  if (dto.campos_metadata !== undefined) updateData.campos_metadata = dto.campos_metadata
  if (dto.icono !== undefined) updateData.icono = dto.icono
  if (dto.orden !== undefined) updateData.orden = dto.orden
  
  if (dto.estado !== undefined) {
    updateData.estado = dto.estado
    if (dto.estado === 'eliminado') {
      updateData.eliminado_en = new Date().toISOString()
    } else if (dto.estado === 'activo' || dto.estado === 'inactivo') {
      updateData.eliminado_en = null
    }
  }
  
  const { data, error } = await supabaseAdmin
    .from('tipo_seccion')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function eliminarTipoSeccion(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('tipo_seccion')
    .update({ estado: 'eliminado', eliminado_en: now })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarTipoSeccion(id: number) {
  const { error } = await supabaseAdmin
    .from('tipo_seccion')
    .update({ estado: 'activo', eliminado_en: null })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}