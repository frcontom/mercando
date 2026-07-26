import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1a1a2e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': { paddingBottom: 16 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0d0d1a',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            paddingTop: '4px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 500,
          },
          '&.Mui-selected .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 700,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.04)',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        },
      },
    },
  },
})
