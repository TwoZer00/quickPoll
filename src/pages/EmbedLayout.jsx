import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material'
import { Suspense, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { indigo } from '@mui/material/colors'
import { ColorModeProvider } from '../hook/useColorMode'
import useColorMode from '../hook/useColorMode'

function buildTheme (mode) {
  const dark = mode === 'dark'
  return responsiveFontSizes(createTheme({
    palette: {
      mode,
      primary: { main: indigo[600] },
      secondary: { main: indigo[400] },
      background: { default: dark ? '#0a0a0a' : '#f5f5f5', paper: dark ? '#111111' : '#ffffff' }
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, borderRadius: 6, boxShadow: 'none', '&:hover': { boxShadow: 'none' } } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: 8 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 0 } } }
    }
  }))
}

function EmbedLayoutInner () {
  const { mode } = useColorMode()
  const theme = useMemo(() => buildTheme(mode), [mode])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </ThemeProvider>
  )
}

export default function EmbedLayout () {
  return (
    <ColorModeProvider>
      <EmbedLayoutInner />
    </ColorModeProvider>
  )
}
