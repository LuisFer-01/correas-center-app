import { Outlet } from 'react-router-dom'

export const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Aquí irá el Header público en la Fase 2 */}
      <header className="border-b p-4">
        <h1 className="text-xl font-bold">{import.meta.env.VITE_APP_TITLE} (Público)</h1>
      </header>

      <main className="flex-1">
        <Outlet /> {/* Renderiza las rutas hijas (Home, Productos, etc.) */}
      </main>

      {/* Aquí irá el Footer público en la Fase 2 */}
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Correas Center. Todos los derechos reservados.
      </footer>
    </div>
  )
}