import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook personalizado que desplaza la vista hacia la parte superior 
 * de la página cada vez que cambia la ruta (pathname).
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Desplazamiento suave hacia arriba al cambiar de ruta
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [pathname])
}