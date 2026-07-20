import { ProtectedRoute } from '@/admin/components/ProtectedRoute'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { PublicLayout } from '@/web/layouts/PublicLayout'
import { Home } from '@/web/pages/Home'
import { createBrowserRouter } from 'react-router-dom'
import { Privacy } from '../web/pages/Privacy'
import { Results } from '../web/pages/Search/Results'
import { Terms } from '../web/pages/Terms'

// Placeholder pages (se reemplazarán en las Fases 2 y 4)
//const HomePage = () => <div className="p-4">Página de Inicio (Web)</div>
const AdminDashboard = () => <div className="p-4">Dashboard del Admin</div>
const AdminLogin = () => <div className="p-4">Login del Admin</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'search', element: <Results /> },
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