import type { CreateUserDTO, Role, UpdateUserDTO, UserProfile } from '@/admin/types/usuario'
import { supabase } from '@/lib/supabase'

export async function getUsuarios(includeDeleted: boolean = false): Promise<UserProfile[]> {
  let query = supabase
    .from('perfiles')
    .select(`id, nombre_completo, email, telefono, avatar_url, estado, eliminado_en, usuario_rol ( roles ( id, nombre, slug ) )`)
  
  if (!includeDeleted) {
    query = query.neq('estado', 'eliminado')
  }
  
  query = query.order('creado_en', { ascending: false })
  
  const { data, error } = await query
  if (error) {
    console.error('Error al obtener usuarios:', error)
    throw error
  }
  
  return (data || []).map((perfil: any) => ({
    id: perfil.id,
    email: perfil.email || 'Sin email',
    nombre_completo: perfil.nombre_completo || 'Sin Nombre',
    telefono: perfil.telefono,
    avatar_url: perfil.avatar_url,
    estado: perfil.estado || 'activo',
    eliminado_en: perfil.eliminado_en,
    roles: perfil.usuario_rol?.map((ur: any) => ur.roles).filter(Boolean) || [],
  }))
}

export async function getRolesDisponibles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, nombre, slug')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function crearUsuario(dto: CreateUserDTO) {
  // Usar función RPC con SECURITY DEFINER para crear usuario en auth
  const { data: authData, error: rpcError } = await supabase
    .rpc('rpc_create_user_with_profile', {
      p_email: dto.email,
      p_password: dto.password,
      p_nombre_completo: dto.nombre_completo,
      p_telefono: dto.telefono || null,
      p_avatar_url: dto.avatar_url || null,
      p_estado: dto.estado,
      p_role_ids: dto.role_ids,
    })
  
  if (rpcError) {
    throw new Error(rpcError.message || 'Error al crear usuario')
  }
  
  return authData
}

export async function actualizarUsuario(dto: UpdateUserDTO) {
  // Usar función RPC con SECURITY DEFINER para actualizar usuario
  const { error: rpcError } = await supabase
    .rpc('rpc_update_user_profile', {
      p_user_id: dto.id,
      p_nombre_completo: dto.nombre_completo,
      p_telefono: dto.telefono || null,
      p_avatar_url: dto.avatar_url || null,
      p_estado: dto.estado,
      p_role_ids: dto.role_ids,
    })
  
  if (rpcError) {
    throw new Error(rpcError.message || 'Error al actualizar usuario')
  }
}

export async function eliminarUsuario(id: string) {
  // Usar función RPC con SECURITY DEFINER para soft delete
  const { error } = await supabase
    .rpc('rpc_soft_delete_user', {
      p_user_id: id
    })
  
  if (error) throw new Error(error.message)
}

export async function restaurarUsuario(id: string) {
  // Usar función RPC con SECURITY DEFINER para restaurar
  const { error } = await supabase
    .rpc('rpc_restore_user', {
      p_user_id: id
    })
  
  if (error) throw new Error(error.message)
}

// Verificar email de usuario
export async function verificarUsuario(id: string) {
  const now = new Date().toISOString()
  
  // 1. Actualizar en tabla perfiles
  const { error: profileError } = await supabase
    .from('perfiles')
    .update({
      email_verified_at: now,
      actualizado_en: now
    })
    .eq('id', id)
  
  if (profileError) throw new Error(profileError.message)
  
  // 2. Actualizar en auth.users (marcar email confirmado)
  const { error: authError } = await supabase.auth.admin.updateUserById(
    id,
    {
      email_confirm: true
    }
  )
  
  if (authError) throw new Error(authError.message)
}

// Restablecer contraseña a valor por defecto
export async function restablecerContrasena(id: string, nuevaContrasena: string = 'prueba123') {
  // Usar función RPC con SECURITY DEFINER
  const { error } = await supabase
    .rpc('rpc_reset_password', {
      p_user_id: id,
      p_new_password: nuevaContrasena
    })
  
  if (error) {
    throw new Error(error.message || 'Error al restablecer contraseña')
  }
}