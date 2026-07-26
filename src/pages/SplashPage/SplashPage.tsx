import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CircularProgress from '@mui/material/CircularProgress'
import { isAuthenticated } from '@/store'
import { waitForSupabase } from '@/core/utils/supabase-init'
import './SplashPage.scss'

export default function SplashPage() {
  const navigate = useNavigate()
  const [connecting, setConnecting] = useState(true)

  useEffect(() => {
    (async () => {
      await waitForSupabase()
      setConnecting(false)
      await new Promise(r => setTimeout(r, 1500))
      navigate(isAuthenticated.value ? '/dashboard' : '/password', { replace: true })
    })()
  }, [navigate])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'background.default' }}>
      <div className="splash-content">
        <div className="splash-icon">
          <ShoppingCartIcon />
        </div>
        <Typography variant="h4" className="splash-title">
          Smart Market
        </Typography>
        <Typography variant="h5" className="splash-subtitle">
          Planner
        </Typography>
        {connecting && (
          <CircularProgress size={20} sx={{ mt: 3, color: 'text.disabled' }} />
        )}
      </div>
    </Box>
  )
}
