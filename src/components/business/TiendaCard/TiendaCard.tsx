import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
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
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: tienda.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {tienda.icono.startsWith('/') || tienda.icono.startsWith('http') ? (
            <img src={tienda.icono} alt={tienda.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            tienda.icono
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {tienda.nombre}
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
