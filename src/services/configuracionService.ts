import { supabase } from '@/lib/supabase'

export interface ConfiguracionItem {
  id: number
  empresa_id: number
  clave: string
  valor: string | null
  tipo: string
  grupo: string
}

// Obtener configuraciones por grupo (con cache manual)
export async function getConfigByGrupo(grupo: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .select('clave, valor, tipo')
    .eq('empresa_id', 1)
    .eq('grupo', grupo)
    .eq('activo', true)

  if (error) {
    console.error(`Error al cargar configuración del grupo "${grupo}":`, error)
    return {}
  }

  // Convertir array a objeto { clave: valor }
  const config: Record<string, string> = {}
  data?.forEach((item: ConfiguracionItem) => {
    if (item.valor !== null) {
      config[item.clave] = item.valor
    }
  })

  return config
}

// Obtener todas las configuraciones activas (útil para cache inicial)
export async function getAllConfig(): Promise<Record<string, Record<string, string>>> {
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .select('clave, valor, grupo')
    .eq('empresa_id', 1)
    .eq('activo', true)

  if (error) {
    console.error('Error al cargar configuraciones:', error)
    return {}
  }

  // Agrupar por grupo
  const grouped: Record<string, Record<string, string>> = {}
  data?.forEach((item: any) => {
    if (!grouped[item.grupo]) {
      grouped[item.grupo] = {}
    }
    if (item.valor !== null) {
      grouped[item.grupo][item.clave] = item.valor
    }
  })

  return grouped
}