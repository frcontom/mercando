import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import { mercados, loadMercados, mercadoProductos, loadMercadoProductos } from '@/store'
import { formatCurrency } from '@/core/utils/formatters'


export default function DashboardPage() {
  const navigate = useNavigate()

  useEffect(() => { loadMercados() }, [])

  const activo = mercados.value.find(m => m.estado !== 'completado')
  const presupuestoUsado = activo
    ? mercadoProductos.value.reduce((s, p) => s + (p.subtotal || p.precio * p.cantidad), 0)
    : 0
  const progress = activo ? Math.min(presupuestoUsado / activo.presupuesto, 1) : 0
  const totalProductos = mercadoProductos.value.length
  const encontrados = mercadoProductos.value.filter(p => p.estado === 'encontrado').length

  useEffect(() => {
    if (activo) loadMercadoProductos(activo.id)
  }, [activo?.id])

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
              <Chip label={activo.estado} size="small" color="warning" />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(activo.fecha).toLocaleDateString()}
            </Typography>
            <Box sx={{ mb: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
                <Typography variant="caption">{formatCurrency(presupuestoUsado)} / {formatCurrency(activo.presupuesto)}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress * 100} sx={{ mt: 0.5, height: 8, borderRadius: 4 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Productos: {totalProductos}
              </Typography>
              <Typography variant="caption" color="success.main">
                Encontrados: {encontrados}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pendientes: {totalProductos - encontrados}
              </Typography>
            </Box>
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
