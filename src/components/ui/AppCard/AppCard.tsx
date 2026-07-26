import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

interface AppCardProps {
  children: ReactNode
  onClick?: () => void
}

export function AppCard({ children, onClick }: AppCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:active': onClick ? { transform: 'scale(0.98)' } : undefined,
        transition: 'transform 0.15s ease',
      }}
    >
      <CardContent>{children}</CardContent>
    </Card>
  )
}
