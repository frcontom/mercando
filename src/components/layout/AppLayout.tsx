import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav/BottomNav'
import { TopBar } from './TopBar/TopBar'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import { PageTransition } from '@/components/ui/PageTransition'
import { fabVisible, fabAction } from '@/store'

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <TopBar title={title} />
      <Box sx={{ flex: 1, overflow: 'auto', scrollBehavior: 'smooth' }}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </Box>
      {fabVisible.value && (
        <Box className="fab-pulse" sx={{ position: 'absolute', bottom: showBottomNav ? 80 : 16, right: 16, zIndex: 10, animation: 'fade-in-up 0.3s ease-out' }}>
          <Fab
            color="primary"
            onClick={() => fabAction.value?.()}
          >
            <AddIcon />
          </Fab>
        </Box>
      )}
      {showBottomNav && <BottomNav />}
    </Box>
  )
}
