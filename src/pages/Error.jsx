import { Box, Button, CssBaseline, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useRouteError, Link as RouterLink, isRouteErrorResponse } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ERRORS from '../const/Const'

function getErrorMessage (error, t) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return t('errors.not-found')
    return error.statusText || t('errors.17')
  }
  return ERRORS[error?.code] || error?.message || t('errors.17')
}

export default function Error () {
  const { t } = useTranslation()
  const error = useRouteError()
  const message = getErrorMessage(error, t)

  useEffect(() => {
    document.title = 'Error'
  }, [])

  return (
    <>
      <CssBaseline />
      <Box component='main' display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3} role='alert'>
        <Typography
          sx={{ ':first-letter': { textTransform: 'uppercase' }, background: 'linear-gradient(135deg, #ff6d00 0%, #ffa000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          textAlign='center' variant='h3' fontWeight={700}
        >
          {message}
        </Typography>
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          {t('error.tryAgain')}
        </Typography>
        <Button variant='contained' component={RouterLink} to='/' sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 600, bgcolor: '#ffa000', '&:hover': { bgcolor: '#ff8f00' } }}>
          {t('error.goHome')}
        </Button>
      </Box>
    </>
  )
}
