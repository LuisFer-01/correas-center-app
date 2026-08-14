import { useEffect } from 'react'

export function GoogleAnalytics() {
  // Leemos directamente de las variables de entorno
  const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID

  useEffect(() => {
    // Si no hay ID o es el placeholder, no hacemos nada
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      return
    }

    // Verificar si el script ya fue cargado para evitar duplicados
    const existingScript = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`)
    if (existingScript) {
      return
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
      gtag('config', '${measurementId}', {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    `
    document.head.appendChild(initScript)

  }, [measurementId])

  return null
}