import { useChatConfig } from '@/hooks/useSiteConfig'
import { useEffect } from 'react'

// Declarar Tawk_API globalmente
declare global {
  interface Window {
    Tawk_API?: any
    Tawk_LoadStart?: Date
  }
}

export function TawkTo() {
  const { config } = useChatConfig()

  useEffect(() => {
    // No cargar si no está activo o faltan IDs
    if (
      !config.tawk_activo ||
      !config.tawk_property_id ||
      !config.tawk_widget_id
    ) {
      return
    }

    // No cargar en desarrollo (opcional)
    if (import.meta.env.DEV) {
      console.log('[Tawk.to] Chat desactivado en modo desarrollo')
      return
    }

    // Verificar si el script ya fue cargado
    const existingScript = document.querySelector('script[src*="embed.tawk.to"]')
    if (existingScript) {
      return // Ya está cargado
    }

    // Inicializar Tawk_API global
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    // Crear e inyectar el script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${config.tawk_property_id}/${config.tawk_widget_id}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    // Manejar errores de carga
    script.onerror = () => {
      console.error('[Tawk.to] Error al cargar el script')
    }

    // Insertar antes del primer script existente (como en el código original)
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }

    // Cleanup
    return () => {
      // Opcional: limpiar si es necesario
      // if (script.parentNode) {
      //   script.parentNode.removeChild(script)
      // }
    }
  }, [config.tawk_property_id, config.tawk_widget_id, config.tawk_activo])

  // Este componente no renderiza nada visible
  return null
}