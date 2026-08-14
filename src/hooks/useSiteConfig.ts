import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export interface SiteConfig {
  analytics: {
    google_analytics_id: string
    google_analytics_activo: boolean
  }
  chat: {
    tawk_property_id: string
    tawk_widget_id: string
    tawk_activo: boolean
  }
  whatsapp: {
    numero: string
    mensaje: string
    activo: boolean
  }
}

export const useSiteConfig = () => {
  return useQuery<SiteConfig>({
    queryKey: ['siteConfig'],
    queryFn: async () => {
      // CORREGIDO: Consultar por las claves específicas
      const { data, error } = await supabase
        .from('configuracion_sitio')
        .select('clave, valor, tipo')
        .in('clave', [
          'google_analytics_id',
          'google_analytics_activo',
          'tawk_property_id',
          'tawk_widget_id',
          'tawk_activo',
          'whatsapp_numero',
          'whatsapp_mensaje',
          'whatsapp_activo',
        ])

      if (error) {
        console.error('Error al cargar configuración:', error)
        throw error
      }

      // Convertir array de clave-valor a objeto
      const configMap: Record<string, any> = {}
      data?.forEach((row) => {
        configMap[row.clave] = row.tipo === 'booleano' 
          ? row.valor === 'true' 
          : row.valor
      })

      return {
        analytics: {
          google_analytics_id: configMap.google_analytics_id || '',
          google_analytics_activo: configMap.google_analytics_activo === true || configMap.google_analytics_activo === 'true',
        },
        chat: {
          tawk_property_id: configMap.tawk_property_id || '',
          tawk_widget_id: configMap.tawk_widget_id || '',
          tawk_activo: configMap.tawk_activo === true || configMap.tawk_activo === 'true',
        },
        whatsapp: {
          numero: configMap.whatsapp_numero || '',
          mensaje: configMap.whatsapp_mensaje || '',
          activo: configMap.whatsapp_activo === true || configMap.whatsapp_activo === 'true',
        },
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de caché
    retry: 2,
  })
}

// Hook específico para Analytics
export const useAnalyticsConfig = () => {
  const { data, isLoading } = useSiteConfig()
  return {
    config: data?.analytics || { google_analytics_id: '', google_analytics_activo: false },
    isLoading,
  }
}

// Hook específico para Chat (Tawk.to)
export const useChatConfig = () => {
  const { data, isLoading } = useSiteConfig()
  return {
    config: data?.chat || { tawk_property_id: '', tawk_widget_id: '', tawk_activo: false },
    isLoading,
  }
}

// Hook específico para WhatsApp
export const useWhatsAppConfig = () => {
  const { data, isLoading } = useSiteConfig()
  return {
    config: data?.whatsapp || { numero: '', mensaje: '', activo: false },
    isLoading,
  }
}