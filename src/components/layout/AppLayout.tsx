import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav/BottomNav'
import { TopBar } from './TopBar/TopBar'
import Box from '@mui/material/Box'
import { PageTransition } from '@/components/ui/PageTransition'

const topBarTitles: Record<string, string> = {
  '/dashboard': 'Smart Market Planner',
  '/mercados': 'Mercados',
  '/tiendas': 'Tiendas',
  '/categorias': 'Categorías',
  '/productos': 'Productos',
  '/configuracion': 'Configuración',
}

export function AppLayout() {
  const location = useLocation()

  const basePath = '/' + location.pathname.split('/')[1]
  const title = topBarTitles[basePath] ?? 'Smart Market Planner'
  const showBottomNav = Object.keys(topBarTitles).includes(basePath)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title={title} />
      <Box sx={{ flex: 1, overflow: 'auto', scrollBehavior: 'smooth' }}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </Box>
      {showBottomNav && <BottomNav />}
    </Box>
  )
}
