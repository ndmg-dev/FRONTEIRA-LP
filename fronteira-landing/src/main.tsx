import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles/global.css'

const AdminApp = lazy(() => import('./pages/Admin/AdminApp'))
const PrivacyPage = lazy(() => import('./pages/Privacy/PrivacyPage'))

const container = document.getElementById('app')
const pathname = window.location.pathname

function Page() {
  if (pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    )
  }
  if (pathname.startsWith('/privacidade')) {
    return (
      <Suspense fallback={null}>
        <PrivacyPage />
      </Suspense>
    )
  }
  return <App />
}

if (container) {
  createRoot(container).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  )
}
