import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { logout, mercados, loadMercados } from '@/store'
import { showSnackbar } from '@/store'
import { useEffect } from 'react'

export default function ConfiguracionPage() {
  const navigate = useNavigate()

  useEffect(() => { loadMercados() }, [])

  function handleLogout() {
    logout()
    navigate('/password', { replace: true })
  }

  function handleExport() {
    const lines: string[] = ['Smart Market Planner - Exportación', `Fecha: ${new Date().toLocaleDateString()}`, '']
    for (const m of mercados.value) {
      lines.push(`📦 ${m.nombre} (${m.estado}) - ${m.fecha}`)
    }
    const text = lines.join('\n')
    navigator.clipboard.writeText(text)
    showSnackbar('Lista copiada al portapapeles')
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        Configuración
      </Typography>

      <Box>
        <Typography variant="subtitle2" gutterBottom>Exportar datos</Typography>
        <Button variant="outlined" onClick={handleExport} fullWidth>
          Copiar lista de mercados
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>Sesión</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout} fullWidth>
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  )
}
