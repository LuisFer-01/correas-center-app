export interface AuditoriaUsuario {
  id: string
  nombre_completo: string
  email: string
}

export interface AuditoriaLog {
  id: number
  usuario_id: string | null
  usuario?: AuditoriaUsuario | null
  accion: 'crear' | 'actualizar' | 'eliminar' | 'login' | 'logout' | string
  tabla_afectada: string
  registro_id: string | null
  datos_anteriores: any | null
  datos_nuevos: any | null
  ip_address: string | null
  user_agent: string | null
  metadata: any
  creado_en: string
}

export interface AuditoriaFilters {
  usuario_id?: string
  accion?: string
  tabla_afectada?: string
  fecha_inicio?: string
  fecha_fin?: string
  limit?: number
  offset?: number
}

export interface AuditoriaStats {
  total: number
  usuariosActivos: number
  tablasAfectadas: number
  accionesDisponibles: number
}