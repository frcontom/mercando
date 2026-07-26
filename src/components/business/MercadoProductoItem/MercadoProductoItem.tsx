import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import HistoryIcon from '@mui/icons-material/History'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import type { MercadoProducto, EstadoProducto } from '@/models'
import { LABEL_ESTADOS } from '@/core/constants/estados'

interface MercadoProductoItemProps {
  item: MercadoProducto
  onDelete: (item: MercadoProducto) => void
  onChangeEstado: (item: MercadoProducto) => void
  onHistory?: (item: MercadoProducto) => void
}

const estadoColors: Record<EstadoProducto, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
  pendiente: 'default',
  encontrado: 'success',
  no_habia: 'warning',
  reemplazado: 'info',
  cancelado: 'error',
}

export function MercadoProductoItem({ item, onDelete, onChangeEstado, onHistory }: MercadoProductoItemProps) {
  return (
    <Card sx={{ '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {item.producto?.nombre ?? 'Producto'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.tienda?.nombre ?? 'Sin tienda'} · {item.cantidad} {item.producto?.unidad ?? ''}
              {item.precio > 0 ? ` · $${item.precio}` : ''}
            </Typography>
          </Box>
          <Chip
            label={LABEL_ESTADOS[item.estado]}
            color={estadoColors[item.estado]}
            size="small"
            onClick={() => onChangeEstado(item)}
          />
          {onHistory && (
            <IconButton size="small" onClick={() => onHistory(item)}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => onDelete(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {item.observacion && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {item.observacion}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
