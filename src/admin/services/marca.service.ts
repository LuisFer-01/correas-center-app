import type { CreateMarcaDTO, Marca, UpdateMarcaDTO } from '@/admin/types/marca'
import { supabase } from '@/lib/supabase'

// Agregado 'export' para que pueda ser importado en MarcaForm.tsx
export const generarSlug = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9]+/g, '-')      // Solo alfanuméricos y guiones
    .replace(/^-+|-+$/g, '')          // Quitar guiones al inicio o final
}

// Generar slug único
async function generarSlugUnico(slugBase: string, excludeId?: number): Promise<string> {
  let slug = slugBase
  let contador = 1
  
  while (true) {
    let query = supabase
      .from('marcas')
      .select('id')
      .eq('slug', slug)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    // ✅ CORREGIDO: Usar maybeSingle() para evitar errores si no existe el slug
    const { data } = await query.maybeSingle()
    
    // Si no hay datos, significa que el slug está disponible
    if (!data) return slug
    
    // Si existe, agregamos un número al final y volvemos a intentar
    slug = `${slugBase}-${contador}`
    contador++
  }
}

// Obtener siguiente orden disponible
export async function getNextOrdenMarca(): Promise<number> {
  const { data, error } = await supabase
    .from('marcas')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle() // ✅ CORREGIDO: maybeSingle para evitar error si la tabla está vacía
  
  if (error || !data) return 1
  return (data.orden || 0) + 1
}

export async function getMarcas(includeDeleted: boolean = false): Promise<Marca[]> {
  let query = supabase
    .from('marcas')
    .select('*')
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('orden', { ascending: true }).order('nombre', { ascending: true })
  
  const { data, error } = await query
  
  if (error) throw error
  return (data || []).map((m: any) => ({
    ...m,
    estado: m.estado || 'activo',
  }))
}

export async function crearMarca(dto: CreateMarcaDTO) {
  const slugFinal = await generarSlugUnico(dto.slug)
  
  const { data, error } = await supabase
    .from('marcas')
    .insert({
      nombre: dto.nombre,
      slug: slugFinal,
      logo: dto.logo,
      orden: dto.orden ?? 0,
      estado: dto.estado || 'activo',
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarMarca(dto: UpdateMarcaDTO) {
  const updateData: any = {}
  
  if (dto.nombre !== undefined) updateData.nombre = dto.nombre
  
  if (dto.slug !== undefined) {
    // Verificar que el slug no esté en uso por otra marca
    const { data: existe } = await supabase
      .from('marcas')
      .select('id')
      .eq('slug', dto.slug)
      .neq('id', dto.id)
      .maybeSingle()
    
    if (existe) {
      throw new Error(`El slug "${dto.slug}" ya está en uso por otra marca`)
    }
    updateData.slug = dto.slug
  }
  
  if (dto.logo !== undefined) updateData.logo = dto.logo
  if (dto.orden !== undefined) updateData.orden = dto.orden
  
  if (dto.estado !== undefined) {
    updateData.estado = dto.estado
    if (dto.estado === 'eliminado') {
      updateData.eliminado_en = new Date().toISOString()
    } else if (dto.estado === 'activo' || dto.estado === 'inactivo') {
      updateData.eliminado_en = null
    }
  }
  
  const { data, error } = await supabase
    .from('marcas')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function eliminarMarca(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('marcas')
    .update({ estado: 'eliminado', eliminado_en: now })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarMarca(id: number) {
  const { error } = await supabase
    .from('marcas')
    .update({ estado: 'activo', eliminado_en: null })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}