import { Box, Button, CssBaseline, ThemeProvider, Typography, createTheme, responsiveFontSizes } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useRouteError, Link as RouterLink, isRouteErrorResponse } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { indigo } from '@mui/material/colors'
function getErrorMessage (error, t) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return t('errors.not-found')
    return error.statusText || t('errors.17')
  }
  const code = error?.code
  if (code !== undefined && t(`errors.${code}`) !== `errors.${code}`) return t(`errors.${code}`)
  return error?.message || t('errors.17')
}

export default function Error () {
  const { t } = useTranslation()
  const error = useRouteError()
  const message = getErrorMessage(error, t)
  const theme = useMemo(() => {
    const mode = localStorage.getItem('colorMode') || 'light'
    return responsiveFontSizes(createTheme({
      palette: { mode, primary: { main: indigo[600] } },
      typography: { fontFamily: '"Inter", "Roboto", sans-serif' }
    }))
  }, [])

  useEffect(() => {
    document.title = 'Error'
    if (import.meta.env.PROD) window.umami?.track('error', { message, url: window.location.pathname })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box component='main' display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3} role='alert'>
        <Typography
          sx={{ ':first-letter': { textTransform: 'uppercase' } }}
          color='primary' textAlign='center' variant='h3' fontWeight={700}
        >
          {message}
        </Typography>
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          {t('error.tryAgain')}
        </Typography>
        <Button variant='contained' component={RouterLink} to='/'>
          {t('error.goHome')}
        </Button>
      </Box>
    </ThemeProvider>
  )
}
