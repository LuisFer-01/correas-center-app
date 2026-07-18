import { Breadcrumbs } from '@/web/components/Breadcrumbs'
import { Footer } from '@/web/components/Footer'
import { Navigation } from '@/web/components/Navigation'
import { WhatsAppFloat } from '@/web/components/WhatsAppFloat'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

export const AppLayout = ({ children, showBreadcrumbs = true }: AppLayoutProps) => {
  const location = useLocation()

  // Rutas donde NO queremos mostrar breadcrumbs
  const hideBreadcrumbsRoutes = ['/']
  const shouldShowBreadcrumbs = showBreadcrumbs && !hideBreadcrumbsRoutes.includes(location.pathname)

  // Google Analytics 4 - Tracking de páginas SPA
  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID

    // Solo ejecutar si hay un ID configurado y gtag está disponible
    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
      return
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Enviar pageview cada vez que cambia la URL
      ;(window as any).gtag('config', GA_ID, {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16 sm:pt-18 md:pt-20">
        {shouldShowBreadcrumbs && <Breadcrumbs />}
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}