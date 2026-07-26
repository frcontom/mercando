import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import InboxIcon from '@mui/icons-material/Inbox'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
      <InboxIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  )
}
