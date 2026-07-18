import { Outlet } from 'react-router-dom'
import { AppLayout } from './AppLayout'

export const PublicLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}