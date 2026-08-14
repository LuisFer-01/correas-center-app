import { useEffect } from 'react'

// Declarar Tawk_API globalmente
declare global {
  interface Window {
    Tawk_API?: any
    Tawk_LoadStart?: Date
  }
}

export function TawkTo() {
  // Leemos directamente de las variables de entorno
  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID

  useEffect(() => {
    // Si faltan los IDs, no hacemos nada
    if (!propertyId || !widgetId) {
      return
    }

    // Verificar si el script ya fue cargado para evitar duplicados
    const existingScript = document.querySelector('script[src*="embed.tawk.to"]')
    if (existingScript) {
      return
    }

    // Inicializar Tawk_API global
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    // Crear e inyectar el script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    // Manejar errores de carga
    script.onerror = () => {
      console.error('[Tawk.to] Error al cargar el script')
    }

    // Insertar antes del primer script existente
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }
  }, [propertyId, widgetId])

  return null
}