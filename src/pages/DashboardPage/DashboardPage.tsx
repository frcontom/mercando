import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import { mercados, loadMercados } from '@/store'
import { formatCurrency } from '@/core/utils/formatters'

export default function DashboardPage() {
  const navigate = useNavigate()

  useEffect(() => { loadMercados() }, [])

  const activo = mercados.value.find(m => m.estado === 'activo')

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Smart Market Planner
      </Typography>

      {activo ? (
        <Card
          onClick={() => navigate(`/mercados/${activo.id}`)}
          sx={{ cursor: 'pointer', mb: 2, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {activo.nombre}
              </Typography>
              <Chip label={activo.estado} size="small" color="success" />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(activo.fecha).toLocaleDateString()} · {formatCurrency(activo.presupuesto)}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No hay mercado activo. Crea uno desde la sección Mercados.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Acceso rápido
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[
          { label: 'Ir a Mercados', path: '/mercados' },
          { label: 'Ir a Tiendas', path: '/tiendas' },
          { label: 'Ir a Categorías', path: '/categorias' },
          { label: 'Ir a Productos', path: '/productos' },
        ].map(item => (
          <Card key={item.path} onClick={() => navigate(item.path)} sx={{ cursor: 'pointer', '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography>{item.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
