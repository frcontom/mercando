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
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
}

export function CategoriaItem({ categoria, onEdit, onDelete }: CategoriaItemProps) {
  return (
    <Card sx={{ '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: '16px !important' }}>
        <Box sx={{ fontSize: 28, flexShrink: 0 }}>{categoria.icono}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {categoria.nombre}
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
