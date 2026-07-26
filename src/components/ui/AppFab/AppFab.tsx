import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

interface AppFabProps {
  onClick: () => void
}

export function AppFab({ onClick }: AppFabProps) {
  return (
    <Fab
      color="primary"
      onClick={onClick}
      sx={{ position: 'fixed', bottom: 80, right: 16 }}
    >
      <AddIcon />
    </Fab>
  )
}
