import { supabase } from '@/lib/supabase'

export interface UpdatePerfilDTO {
  nombre_completo: string
  telefono?: string | null
  avatar_url?: string | null
}

export async function actualizarPerfil(data: UpdatePerfilDTO) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('No hay una sesión activa')
  }

  const { error } = await supabase
    .from('perfiles')
    .update({
      nombre_completo: data.nombre_completo,
      telefono: data.telefono,
      avatar_url: data.avatar_url,
    })
    .eq('id', userData.user.id)

  if (error) throw new Error(error.message)
}

export async function cambiarPassword(nuevaPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: nuevaPassword,
  })
  
  if (error) throw new Error(error.message)
}