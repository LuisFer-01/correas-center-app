import type { CreateUserDTO, Role, UpdateUserDTO, UserProfile } from '@/admin/types/usuario'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function getUsuarios(includeDeleted: boolean = false): Promise<UserProfile[]> {
  let query = supabase
    .from('perfiles')
    .select(`
      id, 
      nombre_completo, 
      email, 
      telefono, 
      avatar_url, 
      estado, 
      eliminado_en,
      usuario_rol (
        roles (
          id,
          nombre,
          slug
        )
      )
    `)
  
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
  // 1. Crear usuario en Auth con metadata
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: dto.email,
    password: dto.password,
    email_confirm: true,
    user_metadata: {
      nombre_completo: dto.nombre_completo,
      telefono: dto.telefono,
      avatar_url: dto.avatar_url,
    }
  })
  
  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Error al crear usuario en Auth')
  }
  
  // 2. Insertar/Actualizar el perfil en la tabla perfiles
  const { error: profileError } = await supabaseAdmin
    .from('perfiles')
    .upsert({
      id: authData.user.id,
      nombre_completo: dto.nombre_completo,
      email: dto.email,
      telefono: dto.telefono,
      avatar_url: dto.avatar_url,
      estado: dto.estado
    })
  
  if (profileError) throw new Error(profileError.message)
  
  // 3. Asignar roles
  if (dto.role_ids.length > 0) {
    const rolesToInsert = dto.role_ids.map((roleId) => ({
      usuario_id: authData.user.id,
      rol_id: roleId,
    }))
    
    const { error: roleError } = await supabaseAdmin
      .from('usuario_rol')
      .insert(rolesToInsert)
    
    if (roleError) throw new Error(roleError.message)
  }
  
  return authData.user
}

export async function actualizarUsuario(dto: UpdateUserDTO) {
  // 1. Actualizar usuario en Auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    dto.id,
    {
      email: dto.email,
      user_metadata: {
        nombre_completo: dto.nombre_completo,
        telefono: dto.telefono,
        avatar_url: dto.avatar_url,
      }
    }
  )
  
  if (authError) {
    throw new Error(`Error actualizando auth: ${authError.message}`)
  }
  
  // 2. Preparar datos de actualización del perfil
  const updateData: any = {
    nombre_completo: dto.nombre_completo,
    email: dto.email,
    telefono: dto.telefono,
    avatar_url: dto.avatar_url,
    estado: dto.estado,
  }
  
  if (dto.estado === 'eliminado') {
    updateData.eliminado_en = new Date().toISOString()
  } else if (dto.estado === 'activo' || dto.estado === 'inactivo') {
    updateData.eliminado_en = null
  }
  
  // 3. Actualizar perfil
  const { error: profileError } = await supabaseAdmin
    .from('perfiles')
    .update(updateData)
    .eq('id', dto.id)
  
  if (profileError) throw new Error(profileError.message)
  
  // 4. Reemplazar roles (solo si no está eliminado)
  if (dto.estado !== 'eliminado') {
    // Borrar roles antiguos
    const { error: deleteError } = await supabaseAdmin
      .from('usuario_rol')
      .delete()
      .eq('usuario_id', dto.id)
    
    if (deleteError) throw new Error(deleteError.message)
    
    // Insertar nuevos roles
    if (dto.role_ids.length > 0) {
      const rolesToInsert = dto.role_ids.map((roleId) => ({
        usuario_id: dto.id,
        rol_id: roleId,
      }))
      
      const { error: insertError } = await supabaseAdmin
        .from('usuario_rol')
        .insert(rolesToInsert)
      
      if (insertError) throw new Error(insertError.message)
    }
  }
}

export async function eliminarUsuario(id: string) {
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('perfiles')
    .update({
      estado: 'eliminado',
      eliminado_en: now
    })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function restaurarUsuario(id: string) {
  const { error } = await supabaseAdmin
    .from('perfiles')
    .update({
      estado: 'activo',
      eliminado_en: null
    })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

// Verificar email de usuario
export async function verificarUsuario(id: string) {
  const now = new Date().toISOString()
  
  // 1. Actualizar en tabla perfiles
  const { error: profileError } = await supabaseAdmin
    .from('perfiles')
    .update({
      email_verified_at: now,
      actualizado_en: now
    })
    .eq('id', id)
  
  if (profileError) throw new Error(profileError.message)
  
  // 2. Actualizar en auth.users (marcar email confirmado)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    id,
    {
      email_confirm: true
    }
  )
  
  if (authError) throw new Error(authError.message)
}

// Restablecer contraseña a valor por defecto
export async function restablecerContrasena(id: string, nuevaContrasena: string = 'prueba123') {
  // Actualizar contraseña en auth.users
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    id,
    {
      password: nuevaContrasena
    }
  )
  
  if (authError) throw new Error(authError.message)
}