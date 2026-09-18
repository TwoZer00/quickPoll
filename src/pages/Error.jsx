import { Box, Button, CssBaseline, ThemeProvider, Typography, createTheme, responsiveFontSizes } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useRouteError, Link as RouterLink, isRouteErrorResponse } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { indigo } from '@mui/material/colors'
import QuickPollLogo, { ErrorBars } from '../components/QuickPollLogo'

function getErrorInfo (error, t) {
  if (isRouteErrorResponse(error)) {
    const status = error.status
    const message = status === 404 ? t('errors.not-found') : error.statusText || t('errors.17')
    return { status, message }
  }
  const code = error?.code
  const message = (code !== undefined && t(`errors.${code}`) !== `errors.${code}`)
    ? t(`errors.${code}`)
    : error?.message || t('errors.17')
  return { status: null, message }
}

export default function Error () {
  const { t } = useTranslation()
  const error = useRouteError()
  const theme = useMemo(() => {
    const mode = localStorage.getItem('colorMode') || 'light'
    return responsiveFontSizes(createTheme({
      palette: { mode, primary: { main: indigo[600] } },
      typography: { fontFamily: '"Inter", "Roboto", sans-serif' }
    }))
  }, [])
  const { status, message } = getErrorInfo(error, t)

  useEffect(() => {
    document.title = 'Error'
    if (import.meta.env.PROD) window.umami?.track('error', { message, url: window.location.pathname })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box component='main' display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3} role='alert' sx={{ position: 'relative', overflow: 'hidden' }}>
        {status && (
          <Typography
            aria-hidden
            sx={{
              position: 'absolute',
              fontSize: 'clamp(160px, 40vw, 320px)',
              fontWeight: 900,
              letterSpacing: -8,
              color: 'primary.main',
              opacity: 0.06,
              userSelect: 'none',
              lineHeight: 1,
              pointerEvents: 'none'
            }}
          >
            {status}
          </Typography>
        )}
        {status ? <QuickPollLogo size='lg' /> : <ErrorBars size='lg' />}
        <Typography
          sx={{ ':first-letter': { textTransform: 'uppercase' }, mt: 1 }}
          color={status ? 'primary' : 'error'} textAlign='center' variant='h5' fontWeight={700}
        >
          {message}
        </Typography>
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          {t('error.tryAgain')}
        </Typography>
        <Button variant='outlined' color='inherit' component={RouterLink} to='/'>
          {t('error.goHome')}
        </Button>
      </Box>
    </ThemeProvider>
  )
}
