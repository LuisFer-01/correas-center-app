import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '@/web/layouts/PublicLayout'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { ProtectedRoute } from '@/admin/components/ProtectedRoute'

// Placeholder pages (se reemplazarán en las Fases 2 y 4)
const HomePage = () => <div className="p-4">Página de Inicio (Web)</div>
const AdminDashboard = () => <div className="p-4">Dashboard del Admin</div>
const AdminLogin = () => <div className="p-4">Login del Admin</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Fase 2: Aquí irán las rutas públicas (/productos, /industrias, etc.)
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        // Todas las rutas dentro de este bloque estarán protegidas
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
          // Fase 4: Aquí irán los CRUDs (/admin/empresas, /admin/productos, etc.)
        ],
      },
    ],
  },
])