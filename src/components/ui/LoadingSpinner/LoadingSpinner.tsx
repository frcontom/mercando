import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  )
}
