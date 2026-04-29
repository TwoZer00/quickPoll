import React from 'react'
import { Box, Button, CssBaseline, Typography } from '@mui/material'
import { PropTypes } from 'prop-types'

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
            <Typography
              variant='h3' fontWeight={700} textAlign='center'
              sx={{ background: 'linear-gradient(135deg, #ff6d00 0%, #ffa000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Something went wrong
            </Typography>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              An unexpected error occurred. Please try again.
            </Typography>
            <Button variant='contained' onClick={() => window.location.assign('/')} sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 600, bgcolor: '#ffa000', '&:hover': { bgcolor: '#ff8f00' } }}>
              Go home
            </Button>
          </Box>
        </>
      )
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}
