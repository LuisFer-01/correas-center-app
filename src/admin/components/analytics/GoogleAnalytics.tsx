import { useAnalyticsConfig } from '@/hooks/useSiteConfig'
import { useEffect } from 'react'

export function GoogleAnalytics() {
  const { config } = useAnalyticsConfig()

  useEffect(() => {
    // No cargar si no está activo o no hay ID
    if (!config.google_analytics_activo || !config.google_analytics_id) {
      return
    }

    // No cargar en desarrollo (opcional, puedes quitar esta condición)
    /* if (import.meta.env.DEV) {
      console.log('[GA] Google Analytics desactivado en modo desarrollo')
      return
    } */

    const measurementId = config.google_analytics_id

    // Verificar si el script ya fue cargado
    const existingScript = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`)
    if (existingScript) {
      return // Ya está cargado
    }

    // 1. Cargar el script de gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    // 2. Inicializar gtag
    const initScript = document.createElement('script')
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `
    document.head.appendChild(initScript)

    // Cleanup: no removemos los scripts para evitar recargas, 
    // pero podríamos hacerlo si el componente se desmonta
    return () => {
      // Opcional: limpiar si es necesario
      // document.head.removeChild(script)
      // document.head.removeChild(initScript)
    }
  }, [config.google_analytics_id, config.google_analytics_activo])

  // Este componente no renderiza nada visible
  return null
}