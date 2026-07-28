import { getAllConfig } from '@/services/configuracionService'
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
}

export const useSiteConfig = () => {
  return useQuery<SiteConfig>({
    queryKey: ['siteConfig'],
    queryFn: async () => {
      const allConfig = await getAllConfig()

      const analytics = allConfig.analytics || {}
      const chat = allConfig.chat || {}

      return {
        analytics: {
          google_analytics_id: analytics.google_analytics_id || '',
          google_analytics_activo: analytics.google_analytics_activo === 'true',
        },
        chat: {
          tawk_property_id: chat.tawk_property_id || '',
          tawk_widget_id: chat.tawk_widget_id || '',
          tawk_activo: chat.tawk_activo === 'true',
        },
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
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

// Hook específico para Chat
export const useChatConfig = () => {
  const { data, isLoading } = useSiteConfig()
  return {
    config: data?.chat || { tawk_property_id: '', tawk_widget_id: '', tawk_activo: false },
    isLoading,
  }
}