import { ProtectedRoute } from '@/admin/components/ProtectedRoute'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { PublicLayout } from '@/web/layouts/PublicLayout'
import { Home } from '@/web/pages/Home'
import { createBrowserRouter } from 'react-router-dom'
import { Dashboard } from '../admin/pages/Dashboard'
import { EmpresasIndex } from '../admin/pages/Empresas/Index'
import { Login } from '../admin/pages/Login'
import { MarcasIndex } from '../admin/pages/Marcas/Index'
import { ProductosIndex } from '../admin/pages/Productos/Index'
import { SucursalesIndex } from '../admin/pages/Sucursales/Index'
import { About } from '../web/pages/About'
import { ApplicationsIndex } from '../web/pages/Applications/Index'
import { ApplicationsShow } from '../web/pages/Applications/Show'
import { Branches } from '../web/pages/Branches'
import { Contact } from '../web/pages/Contact'
import { Privacy } from '../web/pages/Privacy'
import { CategoryDetail } from '../web/pages/Products/CategoryDetail'
import { ProductsIndex } from '../web/pages/Products/Index'
import { ProductShow } from '../web/pages/Products/Show'
import { Results } from '../web/pages/Search/Results'
import { ServicesIndex } from '../web/pages/Services/Index'
import { ServicesShow } from '../web/pages/Services/Show'
import { Terms } from '../web/pages/Terms'

// Placeholder pages (se reemplazarán en las Fases 2 y 4)
// const HomePage = () => <div className="p-4">Página de Inicio (Web)</div>
// const AdminDashboard = () => <div className="p-4">Dashboard del Admin</div>
// const AdminLogin = () => <div className="p-4">Login del Admin</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <Results /> },
      { path: 'products', element: <ProductsIndex /> },
      { path: 'products/:slug', element: <ProductShow /> },
      { path: 'products/:productSlug/:categorySlug', element: <CategoryDetail /> },
      { path: 'applications', element: <ApplicationsIndex /> },
      { path: 'applications/:slug', element: <ApplicationsShow /> },
      { path: 'services', element: <ServicesIndex /> },
      { path: 'services/:slug', element: <ServicesShow /> },
      { path: 'about', element: <About /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'branches', element: <Branches /> },
      { path: 'contact', element: <Contact /> }, 
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'login', element: <Login /> },
      {
        // Todas las rutas dentro de este bloque estarán protegidas
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'empresas', element: <EmpresasIndex /> },
          { path: 'sucursales', element: <SucursalesIndex /> },
          { path: 'marcas', element: <MarcasIndex /> },
          { path: 'productos', element: <ProductosIndex /> }, 
          // Fase 4: Aquí irán los CRUDs (/admin/empresas, /admin/productos, etc.)
        ],
      },
    ],
  },
])