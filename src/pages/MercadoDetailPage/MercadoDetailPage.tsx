import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useParams } from 'react-router-dom'

export default function MercadoDetailPage() {
  const { id } = useParams()

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Mercado {id}</Typography>
    </Box>
  )
}
