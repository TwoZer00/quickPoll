import { Box, CssBaseline, Link, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useRouteError, Link as RouterLink, isRouteErrorResponse } from 'react-router-dom'
import ERRORS from '../const/Const'

function getErrorMessage (error) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return 'page not found'
    return error.statusText || 'something went wrong'
  }
  return ERRORS[error?.code] || error?.message || 'something went wrong'
}

export default function Error () {
  const error = useRouteError()
  const message = getErrorMessage(error)

  useEffect(() => {
    document.title = 'Error'
  }, [])

  return (
    <>
      <CssBaseline />
      <Box component='main' display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3} role='alert'>
        <Typography sx={{ ':first-letter': { textTransform: 'uppercase' } }} textAlign='center' variant='h3' fontWeight={500}>
          {message}
        </Typography>
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          Try going back or refreshing the page.
        </Typography>
        <Link component={RouterLink} to='/'>Go home</Link>
      </Box>
    </>
  )
}
