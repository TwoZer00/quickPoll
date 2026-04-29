import { Box, CssBaseline, Link, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useRouteError, Link as RouterLink } from 'react-router-dom'
import ERRORS from '../const/Const'

export default function Error () {
  const error = useRouteError()
  useEffect(() => {
    document.title = 'Error'
  }, [])
  return (
    <>
      <CssBaseline />
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3}>
        <Typography sx={{ ':first-letter': { textTransform: 'uppercase' } }} textAlign='center' variant='h3' fontWeight={500}>
          {ERRORS[error.code] || 'Something went wrong'}
        </Typography>
        <Link component={RouterLink} to='..'>Go home</Link>
      </Box>
    </>
  )
}
