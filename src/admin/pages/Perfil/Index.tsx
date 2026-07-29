import { PageHeader } from '@/admin/components/shared/PageHeader'
import { PerfilForm } from './components/PerfilForm'

export const PerfilIndex = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Administra tu información personal y credenciales de acceso"
      />
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <PerfilForm />
      </div>
    </div>
  )
}