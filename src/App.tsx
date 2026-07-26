import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme } from '@/core/config/theme'
import { PhoneFrame } from '@/components/layout/PhoneFrame'
import { AppRouter } from '@/router/AppRouter'
import { AppSnackbar } from '@/components/ui/AppSnackbar'

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PhoneFrame>
        <AppRouter />
      </PhoneFrame>
      <AppSnackbar />
    </ThemeProvider>
  )
}
