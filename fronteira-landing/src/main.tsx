import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles/global.css'

const AdminApp = lazy(() => import('./pages/Admin/AdminApp'))

const container = document.getElementById('app')
const isAdminRoute = window.location.pathname.startsWith('/admin')

if (container) {
  createRoot(container).render(
    <StrictMode>
      {isAdminRoute ? (
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
      ) : (
        <App />
      )}
    </StrictMode>,
  )
}
