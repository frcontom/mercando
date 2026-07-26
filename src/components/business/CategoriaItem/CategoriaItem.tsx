import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import type { Categoria } from '@/models'

interface CategoriaItemProps {
  categoria: Categoria
  productCount: number
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
}

export function CategoriaItem({ categoria, productCount, onEdit, onDelete }: CategoriaItemProps) {
  return (
    <Card sx={{
      '&:active': { transform: 'scale(0.97)' },
      transition: 'all 0.2s ease',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '16px !important' }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: 'rgba(144,202,249,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          flexShrink: 0,
        }}>
          {categoria.icono}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {categoria.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {productCount} producto{productCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => onEdit(categoria)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(categoria)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  )
}
