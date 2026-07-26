import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate, useLocation } from 'react-router-dom'

interface TopBarProps {
  title: string
  showBack?: boolean
}

const settingsPaths = ['/dashboard', '/mercados', '/tiendas', '/categorias', '/productos']

export function TopBar({ title, showBack }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const showSettings = settingsPaths.some(p => location.pathname.startsWith(p))

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        {showBack && (
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        {showSettings && (
          <IconButton edge="end" onClick={() => navigate('/configuracion')}>
            <SettingsIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  )
}
