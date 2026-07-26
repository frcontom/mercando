import { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    function handleOnline() { setOffline(false) }
    function handleOffline() { setOffline(true) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
      Sin conexión — los datos se cargarán cuando tengas internet
    </Alert>
  )
}
