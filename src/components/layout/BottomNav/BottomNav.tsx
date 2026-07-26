import { useLocation, useNavigate } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StoreIcon from '@mui/icons-material/Store'
import CategoryIcon from '@mui/icons-material/Category'
import InventoryIcon from '@mui/icons-material/Inventory'
import SettingsIcon from '@mui/icons-material/Settings'

const routes = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'Mercados', icon: <ShoppingCartIcon />, path: '/mercados' },
  { label: 'Tiendas', icon: <StoreIcon />, path: '/tiendas' },
  { label: 'Cat.', icon: <CategoryIcon />, path: '/categorias' },
  { label: 'Prods.', icon: <InventoryIcon />, path: '/productos' },
  { label: 'Config', icon: <SettingsIcon />, path: '/configuracion' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const value = routes.findIndex(r => location.pathname.startsWith(r.path))

  return (
    <BottomNavigation
      value={value === -1 ? 0 : value}
      onChange={(_, index) => navigate(routes[index].path)}
      sx={{
        height: 64,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {routes.map(r => (
        <BottomNavigationAction key={r.path} label={r.label} icon={r.icon} />
      ))}
    </BottomNavigation>
  )
}
