import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Tienda } from '@/models'

interface StoreIconProps {
  tienda?: Tienda
  size?: number
}

export function StoreIcon({ tienda, size = 32 }: StoreIconProps) {
  const icono = tienda?.icono ?? '🛒'
  if (icono.startsWith('/') || icono.startsWith('http')) {
    return (
      <Box
        component="img"
        src={icono}
        alt={tienda?.nombre}
        sx={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
      />
    )
  }
  return <Typography sx={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{icono}</Typography>
}
