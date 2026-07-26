import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import { StoreIcon } from '@/components/business/StoreIcon'
import type { Tienda } from '@/models'

interface TiendaCardProps {
  tienda: Tienda
  onEdit: (tienda: Tienda) => void
  onDelete: (tienda: Tienda) => void
}

export function TiendaCard({ tienda, onEdit, onDelete }: TiendaCardProps) {
  return (
    <Card sx={{ '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '16px !important' }}>
        <StoreIcon tienda={tienda} size={44} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {tienda.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Color: {tienda.color}
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => onEdit(tienda)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(tienda)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  )
}
