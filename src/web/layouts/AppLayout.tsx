import { GoogleAnalytics } from '@/admin/components/analytics/GoogleAnalytics'
import { TawkTo } from '@/admin/components/chat/TawkTo'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { Breadcrumbs } from '@/web/components/Breadcrumbs'
import { Footer } from '@/web/components/Footer'
import { Navigation } from '@/web/components/Navigation'
import { WhatsAppFloat } from '@/web/components/WhatsAppFloat'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

export const AppLayout = ({ children, showBreadcrumbs = true }: AppLayoutProps) => {
  const location = useLocation()

  // Activar el scroll to top para toda la aplicación pública
  useScrollToTop()

  // Rutas donde NO queremos mostrar breadcrumbs
  const hideBreadcrumbsRoutes = ['/']
  const shouldShowBreadcrumbs = showBreadcrumbs && !hideBreadcrumbsRoutes.includes(location.pathname)

  // Google Analytics 4 - Tracking de páginas SPA (ya no es necesario aquí, se maneja en el componente)
  // El componente GoogleAnalytics se encarga de esto

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Componentes que cargan diferidamente */}
      <GoogleAnalytics />
      <TawkTo />
      
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