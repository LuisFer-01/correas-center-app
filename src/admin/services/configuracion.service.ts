import type { ConfiguracionSitio, CreateConfiguracionDTO, UpdateConfiguracionDTO } from '@/admin/types/configuracion'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Hardcodeado a 1 según tu requerimiento
const EMPRESA_ID = 1

export async function getConfiguracion(): Promise<ConfiguracionSitio[]> {
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .select('*')
    .eq('empresa_id', EMPRESA_ID)
    .order('grupo', { ascending: true })
    .order('clave', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function crearConfiguracion(dto: CreateConfiguracionDTO) {
  const { data, error } = await supabaseAdmin
    .from('configuracion_sitio')
    .insert({
      empresa_id: dto.empresa_id,
      clave: dto.clave,
      valor: dto.valor,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      grupo: dto.grupo,
      activo: dto.activo ?? true,
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarConfiguracion(dto: UpdateConfiguracionDTO) {
  const updateData: any = {}
  
  if (dto.valor !== undefined) updateData.valor = dto.valor
  if (dto.activo !== undefined) updateData.activo = dto.activo
  if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
  
  // Actualizar timestamp manualmente
  updateData.actualizado_en = new Date().toISOString()
  
  const { data, error } = await supabaseAdmin
    .from('configuracion_sitio')
    .update(updateData)
    .eq('id', dto.id)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function eliminarConfiguracion(id: number) {
  // Soft delete usando el campo 'activo'
  const { error } = await supabaseAdmin
    .from('configuracion_sitio')
    .update({ activo: false, actualizado_en: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarConfiguracion(id: number) {
  const { error } = await supabaseAdmin
    .from('configuracion_sitio')
    .update({ activo: true, actualizado_en: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

// Helper para obtener el valor de una clave específica (útil para el frontend público)
export async function getConfigValue(clave: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .select('valor')
    .eq('empresa_id', EMPRESA_ID)
    .eq('clave', clave)
    .eq('activo', true)
    .maybeSingle()
  
  if (error || !data) return null
  return data.valor
}