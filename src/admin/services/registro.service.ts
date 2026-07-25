import type {
    CreateRegistroContenidoDTO,
    Registro,
    RegistroContenido,
    UpdateRegistroContenidoDTO,
} from '@/admin/types/registro'
import { supabase } from '@/lib/supabase'

export async function getRegistros(includeDeleted: boolean = false): Promise<Registro[]> {
  let query = supabase
    .from('registros')
    .select('*')
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('orden', { ascending: true }).order('nombre', { ascending: true })
  
  const { data, error } = await query
  if (error) throw error
  
  const registros = (data || []).map((r: any) => ({
    ...r,
    estado: r.estado || 'activo',
  }))
  
  // Cargar conteo de contenidos para cada registro
  if (registros.length > 0) {
    const registrosConConteo = await Promise.all(
      registros.map(async (registro) => {
        const { count } = await supabase
          .from('registro_contenido')
          .select('id', { count: 'exact', head: true })
          .eq('registro_id', registro.id)
          .eq('estado', 'activo')
        
        return { ...registro, conteo_contenidos: count || 0 }
      })
    )
    return registrosConConteo
  }
  
  return registros
}

export async function getContenidosByRegistroId(registroId: number): Promise<RegistroContenido[]> {
  const { data, error } = await supabase
    .from('registro_contenido')
    .select(`
      *,
      empresa:empresas(id, nombre),
      registro:registros(id, identificador, nombre)
    `)
    .eq('registro_id', registroId)
    .neq('estado', 'eliminado')
    .order('orden', { ascending: true })
  
  if (error) throw error
  
  return (data || []).map((c: any) => ({
    ...c,
    estado: c.estado || 'activo',
  }))
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

export async function getNextOrdenContenido(registroId: number): Promise<number> {
  const { data, error } = await supabase
    .from('registro_contenido')
    .select('orden')
    .eq('registro_id', registroId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error || !data) return 1
  return (data.orden || 0) + 1
}

export async function crearRegistroContenido(dto: CreateRegistroContenidoDTO) {
  const { data, error } = await supabase
    .from('registro_contenido')
    .insert({
      empresa_id: dto.empresa_id,
      registro_id: dto.registro_id,
      titulo: dto.titulo,
      subtitulo: dto.subtitulo,
      descripcion: dto.descripcion,
      icono: dto.icono,
      stats: dto.stats,
      orden: dto.orden ?? 0,
      estado: dto.estado || 'activo',
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarRegistroContenido(dto: UpdateRegistroContenidoDTO) {
  const updateData: any = {}
  
  if (dto.empresa_id !== undefined) updateData.empresa_id = dto.empresa_id
  if (dto.registro_id !== undefined) updateData.registro_id = dto.registro_id
  if (dto.titulo !== undefined) updateData.titulo = dto.titulo
  if (dto.subtitulo !== undefined) updateData.subtitulo = dto.subtitulo
  if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
  if (dto.icono !== undefined) updateData.icono = dto.icono
  if (dto.stats !== undefined) updateData.stats = dto.stats
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
    .from('registro_contenido')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function eliminarRegistroContenido(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('registro_contenido')
    .update({ estado: 'eliminado', eliminado_en: now })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarRegistroContenido(id: number) {
  const { error } = await supabase
    .from('registro_contenido')
    .update({ estado: 'activo', eliminado_en: null })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}