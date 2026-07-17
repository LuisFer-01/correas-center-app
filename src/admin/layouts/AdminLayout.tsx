import { Outlet } from 'react-router-dom'

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Aquí irá el Sidebar en la Fase 3 */}
      <aside className="hidden w-64 border-r bg-muted/40 md:block">
        <div className="p-4 font-bold">Admin Panel</div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Aquí irá el Header del Admin con perfil y modo oscuro en la Fase 3 */}
        <header className="flex h-14 items-center border-b px-6">
          <h2 className="text-sm font-semibold">Panel de Administración</h2>
        </header> {/* <-- Asegúrate de que esta etiqueta de cierre esté presente */}

        <main className="flex-1 p-6">
          <Outlet /> {/* Renderiza las rutas hijas protegidas (Dashboard, Productos, etc.) */}
        </main>
      </div>
    </div>
  )
}