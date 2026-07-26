import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { isAuthenticated } from '@/store'
import './SplashPage.scss'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated.value ? '/dashboard' : '/password', { replace: true })
    }, 2200)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Box className="splash-root">
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
      </div>
    </Box>
  )
}
