import { AdminHeader } from '@/admin/components/AdminHeader'
import { AdminSidebar } from '@/admin/components/AdminSidebar'
import { AdminProvider } from '@/providers/AdminProvider'
import { Outlet, useLocation } from 'react-router-dom'

export const AdminLayout = () => {
  const location = useLocation()

  // Ocultar sidebar y header en la página de login
  const isLoginPage = location.pathname === '/admin/login'

  return (
    <AdminProvider>
      <div className="!min-h-screen bg-gray-50 dark:bg-gray-900">
        {isLoginPage ? (
          // En login, solo renderizar el outlet sin layout
          <Outlet />
        ) : (
          <div className="!flex min-h-screen">
            {/* Sidebar como componente independiente */}
            <AdminSidebar />

            {/* Contenido principal */}
            <div className="flex flex-1 flex-col min-w-0">
              <AdminHeader />
              <main className="flex-1 p-6 md:p-8 overflow-auto">
                <Outlet />
              </main>
            </div>
          </div>
        )}
      </div>
    </AdminProvider>
  )
}