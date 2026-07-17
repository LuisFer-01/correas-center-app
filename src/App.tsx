import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Configuración de React Query para manejar el estado asíncrono de Supabase
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})

function App() {
  // Actualizar el título de la pestaña del navegador
  document.title = import.meta.env.VITE_APP_TITLE || 'Correas Center'

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App