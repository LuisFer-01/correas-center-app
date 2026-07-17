import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
}

// Esta exportación actúa como Singleton en toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper para obtener URLs de imágenes desde los buckets de Supabase
export const getSupabaseImageUrl = (path: string | null, bucket: string): string | null => {
  if (!path) return null
  
  // Si ya es una URL completa, retornarla tal cual
  if (path.startsWith('http')) return path
  
  // Construir URL pública de Supabase Storage
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper alternativo para construir URLs manualmente si es necesario
export const buildImageUrl = (bucket: string, path: string): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}