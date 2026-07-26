import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Box from '@mui/material/Box'
import type { Producto } from '@/models'

interface ProductoItemProps {
  producto: Producto
  onEdit: (producto: Producto) => void
  onDelete: (producto: Producto) => void
  onToggleFavorito: (producto: Producto) => void
  onAddToMarket?: (producto: Producto) => void
}

export function ProductoItem({ producto, onEdit, onDelete, onToggleFavorito, onAddToMarket }: ProductoItemProps) {
  return (
    <Card sx={{ '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '16px !important' }}>
        <IconButton size="small" onClick={() => onToggleFavorito(producto)}>
          {producto.favorito ? <StarIcon sx={{ color: 'warning.main' }} /> : <StarBorderIcon />}
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {producto.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {producto.unidad}
          </Typography>
        </Box>
        {onAddToMarket && (
          <IconButton size="small" onClick={() => onAddToMarket(producto)}>
            <AddShoppingCartIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" onClick={() => onEdit(producto)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(producto)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  )
}
