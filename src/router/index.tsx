import { Spinner } from '@/components/ui/spinner'
import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// ============================================================================
// 1. IMPORTACIÓN ESTÁTICA DE LAYOUTS (La "cáscara" de la app)
// ============================================================================
import { ProtectedRoute } from '@/admin/components/ProtectedRoute'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { PublicLayout } from '@/web/layouts/PublicLayout'

// ============================================================================
// 2. HELPER PARA LAZY LOAD DE EXPORTACIONES NOMBRADAS
// ============================================================================
// Esto soluciona el error de TypeScript: "La propiedad default falta..."
const lazyLoad = (importFunc: () => Promise<any>, exportName: string) =>
  React.lazy(() => importFunc().then((module) => ({ default: module[exportName] })))

// ============================================================================
// 3. IMPORTACIÓN LAZY (Diferida) DE PÁGINAS
// ============================================================================

// --- Rutas Públicas ---
const Home = lazyLoad(() => import('@/web/pages/Home'), 'Home')
const Results = lazyLoad(() => import('@/web/pages/Search/Results'), 'Results')
const ProductsIndex = lazyLoad(() => import('@/web/pages/Products/Index'), 'ProductsIndex')
const ProductShow = lazyLoad(() => import('@/web/pages/Products/Show'), 'ProductShow')
const CategoryDetail = lazyLoad(() => import('@/web/pages/Products/CategoryDetail'), 'CategoryDetail')
const ApplicationsIndex = lazyLoad(() => import('@/web/pages/Applications/Index'), 'ApplicationsIndex')
const ApplicationsShow = lazyLoad(() => import('@/web/pages/Applications/Show'), 'ApplicationsShow')
const ServicesIndex = lazyLoad(() => import('@/web/pages/Services/Index'), 'ServicesIndex')
const ServicesShow = lazyLoad(() => import('@/web/pages/Services/Show'), 'ServicesShow')
const About = lazyLoad(() => import('@/web/pages/About'), 'About')
const Privacy = lazyLoad(() => import('@/web/pages/Privacy'), 'Privacy')
const Terms = lazyLoad(() => import('@/web/pages/Terms'), 'Terms')
const Branches = lazyLoad(() => import('@/web/pages/Branches'), 'Branches')
const Contact = lazyLoad(() => import('@/web/pages/Contact'), 'Contact')

// --- Rutas de Admin ---
const Login = lazyLoad(() => import('@/admin/pages/Login'), 'Login')
const Dashboard = lazyLoad(() => import('@/admin/pages/Dashboard'), 'Dashboard')
const PerfilIndex = lazyLoad(() => import('@/admin/pages/Perfil/Index'), 'PerfilIndex')
const EmpresasIndex = lazyLoad(() => import('@/admin/pages/Empresas/Index'), 'EmpresasIndex')
const SucursalesIndex = lazyLoad(() => import('@/admin/pages/Sucursales/Index'), 'SucursalesIndex')
const MarcasIndex = lazyLoad(() => import('@/admin/pages/Marcas/Index'), 'MarcasIndex')
const ProductosIndex = lazyLoad(() => import('@/admin/pages/Productos/Index'), 'ProductosIndex')
const CategoriasIndex = lazyLoad(() => import('@/admin/pages/Categorias/Index'), 'CategoriasIndex')
const ServiciosIndex = lazyLoad(() => import('@/admin/pages/Servicios/Index'), 'ServiciosIndex')
const IndustriasIndex = lazyLoad(() => import('@/admin/pages/Industrias/Index'), 'IndustriasIndex')
const MenusIndex = lazyLoad(() => import('@/admin/pages/Menus/Index'), 'MenusIndex')
const FootersIndex = lazyLoad(() => import('@/admin/pages/Footers/Index'), 'FootersIndex')
const SeccionesIndex = lazyLoad(() => import('@/admin/pages/Secciones/Index'), 'SeccionesIndex')
const RegistrosIndex = lazyLoad(() => import('@/admin/pages/Registros/Index'), 'RegistrosIndex')
const RolesIndex = lazyLoad(() => import('@/admin/pages/Roles/Index'), 'RolesIndex')
const UsuariosIndex = lazyLoad(() => import('@/admin/pages/Usuarios/Index'), 'UsuariosIndex')
const ContactosIndex = lazyLoad(() => import('@/admin/pages/Contactos/Index'), 'ContactosIndex')
const SuscriptoresIndex = lazyLoad(() => import('@/admin/pages/Suscriptores/Index'), 'SuscriptoresIndex')
const AuditoriaIndex = lazyLoad(() => import('@/admin/pages/Auditoria/Index'), 'AuditoriaIndex')
const PasosWizardIndex = lazyLoad(() => import('@/admin/pages/PasosWizard/Index'), 'PasosWizardIndex')
const TiposAtributoIndex = lazyLoad(() => import('@/admin/pages/TiposAtributo/Index'), 'TiposAtributoIndex')
const AtributosIndex = lazyLoad(() => import('@/admin/pages/Atributos/Index'), 'AtributosIndex')
const TiposSeccionIndex = lazyLoad(() => import('@/admin/pages/TiposSeccion/Index'), 'TiposSeccionIndex')
const ConfiguracionIndex = lazyLoad(() => import('@/admin/pages/Configuracion/Index'), 'ConfiguracionIndex')

// ============================================================================
// 4. COMPONENTE FALLBACK (Se muestra mientras carga la ruta)
// ============================================================================
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
    <Spinner className="h-10 w-10 text-[#EA0A2A]" />
  </div>
)

// ============================================================================
// 5. CONFIGURACIÓN DEL ROUTER
// ============================================================================
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageLoader />}><Results /></Suspense> },
      { path: 'products', element: <Suspense fallback={<PageLoader />}><ProductsIndex /></Suspense> },
      { path: 'products/:slug', element: <Suspense fallback={<PageLoader />}><ProductShow /></Suspense> },
      { path: 'products/:productSlug/:categorySlug', element: <Suspense fallback={<PageLoader />}><CategoryDetail /></Suspense> },
      { path: 'applications', element: <Suspense fallback={<PageLoader />}><ApplicationsIndex /></Suspense> },
      { path: 'applications/:slug', element: <Suspense fallback={<PageLoader />}><ApplicationsShow /></Suspense> },
      { path: 'services', element: <Suspense fallback={<PageLoader />}><ServicesIndex /></Suspense> },
      { path: 'services/:slug', element: <Suspense fallback={<PageLoader />}><ServicesShow /></Suspense> },
      { path: 'about', element: <Suspense fallback={<PageLoader />}><About /></Suspense> },
      { path: 'privacy', element: <Suspense fallback={<PageLoader />}><Privacy /></Suspense> },
      { path: 'terms', element: <Suspense fallback={<PageLoader />}><Terms /></Suspense> },
      { path: 'branches', element: <Suspense fallback={<PageLoader />}><Branches /></Suspense> },
      { path: 'contact', element: <Suspense fallback={<PageLoader />}><Contact /></Suspense> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'login', element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: 'perfil', element: <Suspense fallback={<PageLoader />}><PerfilIndex /></Suspense> },
          { path: 'empresas', element: <Suspense fallback={<PageLoader />}><EmpresasIndex /></Suspense> },
          { path: 'sucursales', element: <Suspense fallback={<PageLoader />}><SucursalesIndex /></Suspense> },
          { path: 'marcas', element: <Suspense fallback={<PageLoader />}><MarcasIndex /></Suspense> },
          { path: 'productos', element: <Suspense fallback={<PageLoader />}><ProductosIndex /></Suspense> },
          { path: 'categorias', element: <Suspense fallback={<PageLoader />}><CategoriasIndex /></Suspense> },
          { path: 'servicios', element: <Suspense fallback={<PageLoader />}><ServiciosIndex /></Suspense> },
          { path: 'industrias', element: <Suspense fallback={<PageLoader />}><IndustriasIndex /></Suspense> },
          { path: 'menus', element: <Suspense fallback={<PageLoader />}><MenusIndex /></Suspense> },
          { path: 'footers', element: <Suspense fallback={<PageLoader />}><FootersIndex /></Suspense> },
          { path: 'secciones', element: <Suspense fallback={<PageLoader />}><SeccionesIndex /></Suspense> },
          { path: 'registros', element: <Suspense fallback={<PageLoader />}><RegistrosIndex /></Suspense> },
          { path: 'roles', element: <Suspense fallback={<PageLoader />}><RolesIndex /></Suspense> },
          { path: 'usuarios', element: <Suspense fallback={<PageLoader />}><UsuariosIndex /></Suspense> },
          { path: 'contactos', element: <Suspense fallback={<PageLoader />}><ContactosIndex /></Suspense> },
          { path: 'suscriptores', element: <Suspense fallback={<PageLoader />}><SuscriptoresIndex /></Suspense> },
          { path: 'auditoria', element: <Suspense fallback={<PageLoader />}><AuditoriaIndex /></Suspense> },
          { path: 'pasos-wizard', element: <Suspense fallback={<PageLoader />}><PasosWizardIndex /></Suspense> },
          { path: 'tipos-atributo', element: <Suspense fallback={<PageLoader />}><TiposAtributoIndex /></Suspense> },
          { path: 'atributos', element: <Suspense fallback={<PageLoader />}><AtributosIndex /></Suspense> },
          { path: 'tipos-seccion', element: <Suspense fallback={<PageLoader />}><TiposSeccionIndex /></Suspense> },
          { path: 'configuracion', element: <Suspense fallback={<PageLoader />}><ConfiguracionIndex /></Suspense> },
        ],
      },
    ],
  },
])