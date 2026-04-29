import React from 'react'
import { Box, Button, CssBaseline, Typography } from '@mui/material'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  render () {
    if (this.state.hasError) {
      return (
        <>
          <CssBaseline />
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100dvh' gap={2} p={3} role='alert'>
            <Typography variant='h3' fontWeight={500} textAlign='center'>
              Something went wrong
            </Typography>
            <Typography variant='body1' color='text.secondary' textAlign='center'>
              An unexpected error occurred. Please try again.
            </Typography>
            <Button variant='contained' onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </Box>
        </>
      )
    }
    return this.props.children
  }
}
