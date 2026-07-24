import type { CreateIndustriaDTO, Industria, UpdateIndustriaDTO } from '@/admin/types/industria'
import { supabase } from '@/lib/supabase'

// Exportado para poder usarlo en el formulario
export const generarSlug = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generarSlugUnico(slugBase: string, excludeId?: number): Promise<string> {
  let slug = slugBase
  let contador = 1
  
  while (true) {
    let query = supabase
      .from('industrias')
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

export async function getIndustrias(includeDeleted: boolean = false): Promise<Industria[]> {
  let query = supabase
    .from('industrias')
    .select(`
      *,
      empresa:empresas(id, nombre)
    `)
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('orden', { ascending: true }).order('nombre', { ascending: true })
  
  const { data, error } = await query
  if (error) throw error
  
  const industrias = (data || []).map((i: any) => ({
    ...i,
    estado: i.estado || 'activo',
  }))
  
  // Cargar asignaciones por separado
  if (industrias.length > 0) {
    const industriaIds = industrias.map(i => i.id)
    const { data: asignacionesData, error: asignacionesError } = await supabase
      .from('industria_asignacion')
      .select('*')
      .in('industria_id', industriaIds)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })
    
    if (asignacionesError) {
      console.error('Error cargando asignaciones:', asignacionesError)
      return industrias
    }
    
    // Cargar categorías y servicios por separado
    const categoriaIds = asignacionesData
      .filter(a => a.tipo_registro === 'categoria')
      .map(a => a.registro_id)
    const servicioIds = asignacionesData
      .filter(a => a.tipo_registro === 'servicio')
      .map(a => a.registro_id)
    
    let categoriasMap = new Map()
    let serviciosMap = new Map()
    
    if (categoriaIds.length > 0) {
      const { data: catsData } = await supabase
        .from('categorias')
        .select('id, nombre, slug')
        .in('id', categoriaIds)
      catsData?.forEach(cat => categoriasMap.set(cat.id, cat))
    }
    
    if (servicioIds.length > 0) {
      const { data: servData } = await supabase
        .from('servicios')
        .select('id, nombre, descripcion')
        .in('id', servicioIds)
      servData?.forEach(serv => serviciosMap.set(serv.id, serv))
    }
    
    // Asignar las relaciones a cada industria
    return industrias.map(industria => ({
      ...industria,
      asignaciones: asignacionesData
        .filter(a => a.industria_id === industria.id)
        .map(asig => ({
          ...asig,
          categoria: asig.tipo_registro === 'categoria' ? categoriasMap.get(asig.registro_id) : null,
          servicio: asig.tipo_registro === 'servicio' ? serviciosMap.get(asig.registro_id) : null,
        }))
    }))
  }
  
  return industrias
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

export async function getCategoriasActivas() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getServiciosActivos() {
  const { data, error } = await supabase
    .from('servicios')
    .select('id, nombre, descripcion')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getNextOrdenIndustria(): Promise<number> {
  const { data, error } = await supabase
    .from('industrias')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error || !data) return 1
  return (data.orden || 0) + 1
}

export async function crearIndustria(dto: CreateIndustriaDTO) {
  const slugFinal = await generarSlugUnico(dto.slug)
  
  const { data: industriaData, error: industriaError } = await supabase
    .from('industrias')
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
  
  if (industriaError) throw new Error(industriaError.message)
  
  // Crear asignaciones de categorías
  if (dto.categoria_ids && dto.categoria_ids.length > 0) {
    const asignacionesCategorias = dto.categoria_ids.map((categoriaId, index) => ({
      industria_id: industriaData.id,
      tipo_registro: 'categoria',
      registro_id: categoriaId,
      orden: index,
      estado: 'activo',
    }))
    
    const { error: catError } = await supabase
      .from('industria_asignacion')
      .insert(asignacionesCategorias)
    
    if (catError) throw new Error(catError.message)
  }
  
  // Crear asignaciones de servicios
  if (dto.servicio_ids && dto.servicio_ids.length > 0) {
    const asignacionesServicios = dto.servicio_ids.map((servicioId, index) => ({
      industria_id: industriaData.id,
      tipo_registro: 'servicio',
      registro_id: servicioId,
      orden: index,
      estado: 'activo',
    }))
    
    const { error: servError } = await supabase
      .from('industria_asignacion')
      .insert(asignacionesServicios)
    
    if (servError) throw new Error(servError.message)
  }
  
  return industriaData
}

export async function actualizarIndustria(dto: UpdateIndustriaDTO) {
  const updateData: any = {}
  
  if (dto.empresa_id !== undefined) updateData.empresa_id = dto.empresa_id
  if (dto.nombre !== undefined) updateData.nombre = dto.nombre
  
  if (dto.slug !== undefined) {
    const { data: existe } = await supabase
      .from('industrias')
      .select('id')
      .eq('slug', dto.slug)
      .neq('id', dto.id)
      .maybeSingle()
    
    if (existe) {
      throw new Error(`El slug "${dto.slug}" ya está en uso por otra industria`)
    }
    updateData.slug = dto.slug
  }
  
  if (dto.imagen !== undefined) updateData.imagen = dto.imagen
  if (dto.orden !== undefined) updateData.orden = dto.orden
  
  if (dto.estado !== undefined) {
    updateData.estado = dto.estado
    if (dto.estado === 'eliminado') {
      updateData.eliminado_en = new Date().toISOString()
    } else if (dto.estado === 'activo' || dto.estado === 'inactivo') {
      updateData.eliminado_en = null
    }
  }
  
  const { data: industriaData, error: industriaError } = await supabase
    .from('industrias')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (industriaError) throw new Error(industriaError.message)
  
  // Actualizar asignaciones de categorías si se proporcionaron
  if (dto.categoria_ids !== undefined) {
    // Borrar asignaciones de categorías antiguas
    const { error: deleteCatError } = await supabase
      .from('industria_asignacion')
      .delete()
      .eq('industria_id', dto.id)
      .eq('tipo_registro', 'categoria')
    
    if (deleteCatError) throw new Error(deleteCatError.message)
    
    // Crear nuevas asignaciones de categorías
    if (dto.categoria_ids.length > 0) {
      const asignacionesCategorias = dto.categoria_ids.map((categoriaId, index) => ({
        industria_id: dto.id,
        tipo_registro: 'categoria',
        registro_id: categoriaId,
        orden: index,
        estado: 'activo',
      }))
      
      const { error: insertCatError } = await supabase
        .from('industria_asignacion')
        .insert(asignacionesCategorias)
      
      if (insertCatError) throw new Error(insertCatError.message)
    }
  }
  
  // Actualizar asignaciones de servicios si se proporcionaron
  if (dto.servicio_ids !== undefined) {
    // Borrar asignaciones de servicios antiguas
    const { error: deleteServError } = await supabase
      .from('industria_asignacion')
      .delete()
      .eq('industria_id', dto.id)
      .eq('tipo_registro', 'servicio')
    
    if (deleteServError) throw new Error(deleteServError.message)
    
    // Crear nuevas asignaciones de servicios
    if (dto.servicio_ids.length > 0) {
      const asignacionesServicios = dto.servicio_ids.map((servicioId, index) => ({
        industria_id: dto.id,
        tipo_registro: 'servicio',
        registro_id: servicioId,
        orden: index,
        estado: 'activo',
      }))
      
      const { error: insertServError } = await supabase
        .from('industria_asignacion')
        .insert(asignacionesServicios)
      
      if (insertServError) throw new Error(insertServError.message)
    }
  }
  
  return industriaData
}

export async function eliminarIndustria(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('industrias')
    .update({ estado: 'eliminado', eliminado_en: now })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarIndustria(id: number) {
  const { error } = await supabase
    .from('industrias')
    .update({ estado: 'activo', eliminado_en: null })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}