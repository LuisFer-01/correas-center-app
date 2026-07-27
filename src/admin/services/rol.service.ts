import type { CreateRolDTO, Permiso, PermisosAgrupados, Rol, UpdateRolDTO } from '@/admin/types/rol'
import { supabase } from '@/lib/supabase'

export async function getRoles(includeDeleted: boolean = false): Promise<Rol[]> {
  let query = supabase
    .from('roles')
    .select(`id, nombre, slug, descripcion, es_sistema, estado, eliminado_en, rol_permiso ( permiso_id, permisos ( id, nombre, slug, grupo, descripcion, estado ) )`)
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('nombre', { ascending: true })
  
  const { data, error } = await query
  if (error) throw error
  
  return (data || []).map((rol: any) => ({
    id: rol.id,
    nombre: rol.nombre,
    slug: rol.slug,
    descripcion: rol.descripcion,
    es_sistema: rol.es_sistema,
    estado: rol.estado || 'activo',
    eliminado_en: rol.eliminado_en,
    permisos: rol.rol_permiso?.map((rp: any) => rp.permisos).filter(Boolean) || [],
  }))
}

export async function getPermisosAgrupados(): Promise<PermisosAgrupados> {
  const { data, error } = await supabase
    .from('permisos')
    .select('id, nombre, slug, grupo, descripcion, estado')
    .eq('estado', 'activo')
    .order('grupo', { ascending: true })
    .order('nombre', { ascending: true })
  
  if (error) throw error
  
  const agrupados: PermisosAgrupados = {}
  ;(data || []).forEach((permiso: Permiso) => {
    if (!agrupados[permiso.grupo]) {
      agrupados[permiso.grupo] = []
    }
    agrupados[permiso.grupo].push(permiso)
  })
  
  return agrupados
}

export async function crearRol(dto: CreateRolDTO) {
  const { data: rolData, error: rolError } = await supabase
    .from('roles')
    .insert({
      nombre: dto.nombre,
      slug: dto.slug,
      descripcion: dto.descripcion,
      es_sistema: false,
      estado: 'activo',
    })
    .select()
    .single()
  
  if (rolError) throw new Error(rolError.message)
  
  if (dto.permiso_ids.length > 0) {
    const permisosToInsert = dto.permiso_ids.map((permisoId) => ({
      rol_id: rolData.id,
      permiso_id: permisoId,
    }))
    
    const { error: permError } = await supabase
      .from('rol_permiso')
      .insert(permisosToInsert)
    
    if (permError) throw new Error(permError.message)
  }
  
  return rolData
}

export async function actualizarRol(dto: UpdateRolDTO) {
  const updateData: any = {}
  
  if (dto.nombre !== undefined) updateData.nombre = dto.nombre
  if (dto.slug !== undefined) updateData.slug = dto.slug
  if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
  
  const { error: rolError } = await supabase
    .from('roles')
    .update(updateData)
    .eq('id', dto.id)
  
  if (rolError) throw new Error(rolError.message)
  
  if (dto.permiso_ids !== undefined) {
    const { error: deleteError } = await supabase
      .from('rol_permiso')
      .delete()
      .eq('rol_id', dto.id)
    
    if (deleteError) throw new Error(deleteError.message)
    
    if (dto.permiso_ids.length > 0) {
      const permisosToInsert = dto.permiso_ids.map((permisoId) => ({
        rol_id: dto.id,
        permiso_id: permisoId,
      }))
      
      const { error: insertError } = await supabase
        .from('rol_permiso')
        .insert(permisosToInsert)
      
      if (insertError) throw new Error(insertError.message)
    }
  }
}

// ✅ NUEVA: Actualizar solo los permisos de un rol
export async function actualizarPermisosRol(rolId: number, permisoIds: number[]) {
  // Borrar permisos actuales
  const { error: deleteError } = await supabase
    .from('rol_permiso')
    .delete()
    .eq('rol_id', rolId)
  
  if (deleteError) throw new Error(deleteError.message)
  
  // Insertar nuevos permisos
  if (permisoIds.length > 0) {
    const permisosToInsert = permisoIds.map((permisoId) => ({
      rol_id: rolId,
      permiso_id: permisoId,
    }))
    
    const { error: insertError } = await supabase
      .from('rol_permiso')
      .insert(permisosToInsert)
    
    if (insertError) throw new Error(insertError.message)
  }
}

export async function eliminarRol(id: number) {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('roles')
    .update({
      estado: 'eliminado',
      eliminado_en: now,
    })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

// ✅ NUEVA: Restaurar rol eliminado
export async function restaurarRol(id: number) {
  const { error } = await supabase
    .from('roles')
    .update({
      estado: 'activo',
      eliminado_en: null,
    })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export function traducirGrupo(grupo: string): string {
  const traducciones: Record<string, string> = {
    dashboard: 'Dashboard',
    empresa: 'Empresa',
    sucursales: 'Sucursales',
    productos: 'Productos',
    categorias: 'Categorías',
    marcas: 'Marcas',
    atributos: 'Atributos',
    industrias: 'Industrias',
    servicios: 'Servicios',
    contenido: 'Contenido',
    menus: 'Menús',
    footers: 'Footers',
    registros: 'Registros',
    wizard: 'Wizard',
    contactos: 'Contactos',
    suscriptores: 'Suscriptores',
    usuarios: 'Usuarios',
    roles: 'Roles y Permisos',
    auditoria: 'Auditoría',
  }
  return traducciones[grupo] || grupo
}