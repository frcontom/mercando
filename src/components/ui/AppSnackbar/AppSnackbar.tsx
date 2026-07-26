import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { snackbarOpen, snackbarMessage, hideSnackbar } from '@/store'

export function AppSnackbar() {
  return (
    <Snackbar
      open={snackbarOpen.value}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={hideSnackbar} severity="success" variant="filled">
        {snackbarMessage.value}
      </Alert>
    </Snackbar>
  )
}
