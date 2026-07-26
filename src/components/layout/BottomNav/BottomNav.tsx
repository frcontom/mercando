import { useLocation, useNavigate } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Badge from '@mui/material/Badge'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StoreIcon from '@mui/icons-material/Store'
import CategoryIcon from '@mui/icons-material/Category'
import InventoryIcon from '@mui/icons-material/Inventory'
import { pendingCount, userRole } from '@/store'

const routes = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'Mercados', icon: <ShoppingCartIcon />, path: '/mercados' },
  { label: 'Tiendas', icon: <StoreIcon />, path: '/tiendas' },
  { label: 'Cat.', icon: <CategoryIcon />, path: '/categorias' },
  { label: 'Prods.', icon: <InventoryIcon />, path: '/productos' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const value = routes.findIndex(r => location.pathname.startsWith(r.path))

  if (userRole.value !== 'admin') return null

  return (
    <BottomNavigation
      value={value === -1 ? 0 : value}
      onChange={(_, index) => navigate(routes[index].path)}
      sx={{ height: 64 }}
    >
      {routes.map(r => (
        <BottomNavigationAction
          key={r.path}
          label={r.label}
          icon={r.path === '/mercados' ? (
            <Badge badgeContent={pendingCount.value} color="warning" max={99} invisible={pendingCount.value === 0}>
              {r.icon}
            </Badge>
          ) : r.icon}
          sx={{ minWidth: 0 }}
        />
      ))}
    </BottomNavigation>
  )
}
