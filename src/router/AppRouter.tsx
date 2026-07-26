import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PageTransition } from '@/components/ui/PageTransition'
import { waitForSupabase } from '@/core/utils/supabase-init'
import { subscribeToChanges } from '@/core/utils/realtime'

const SplashPage = lazy(() => import('@/pages/SplashPage/SplashPage'))
const PasswordPage = lazy(() => import('@/pages/PasswordPage/PasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage/DashboardPage'))
const MercadosPage = lazy(() => import('@/pages/MercadosPage/MercadosPage'))
const MercadoDetailPage = lazy(() => import('@/pages/MercadoDetailPage/MercadoDetailPage'))
const TiendasPage = lazy(() => import('@/pages/TiendasPage/TiendasPage'))
const CategoriasPage = lazy(() => import('@/pages/CategoriasPage/CategoriasPage'))
const ProductosPage = lazy(() => import('@/pages/ProductosPage/ProductosPage'))
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage/ConfiguracionPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated.value) return <Navigate to="/password" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (isAuthenticated.value) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <PageTransition>{children}</PageTransition>
  </Suspense>
)

function SupabaseGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    waitForSupabase().then(() => {
      setReady(true)
      subscribeToChanges()
    })
  }, [])
  if (!ready) return <LoadingSpinner />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <HashRouter>
      <SupabaseGate>
      <Routes>
        <Route path="/" element={
          <SuspenseWrapper>
            <SplashPage />
          </SuspenseWrapper>
        } />
        <Route path="/password" element={
          <PublicRoute>
            <SuspenseWrapper>
              <PasswordPage />
            </SuspenseWrapper>
          </PublicRoute>
        } />
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
          <Route path="/mercados" element={<SuspenseWrapper><MercadosPage /></SuspenseWrapper>} />
          <Route path="/mercados/:id" element={<SuspenseWrapper><MercadoDetailPage /></SuspenseWrapper>} />
          <Route path="/tiendas" element={<SuspenseWrapper><TiendasPage /></SuspenseWrapper>} />
          <Route path="/categorias" element={<SuspenseWrapper><CategoriasPage /></SuspenseWrapper>} />
          <Route path="/productos" element={<SuspenseWrapper><ProductosPage /></SuspenseWrapper>} />
          <Route path="/configuracion" element={<SuspenseWrapper><ConfiguracionPage /></SuspenseWrapper>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </SupabaseGate>
    </HashRouter>
  )
}
