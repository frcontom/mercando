import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/store'

export default function ConfiguracionPage() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/password', { replace: true })
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Configuración
      </Typography>
      <Button variant="outlined" color="error" onClick={handleLogout} fullWidth>
        Cerrar sesión
      </Button>
    </Box>
  )
}
