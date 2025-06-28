import { Alert, Box, CssBaseline, Slide, Snackbar, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import Menu from '../components/Menu'
import { Link } from '@mui/icons-material'

export default function InitAuth () {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState()
  const handleOpen = () => setOpen(true)
  const [title, setTitle] = useState('QuickPoll - Create your polls, share it and see the results')
  const handleClose = () => {
    setOpen(false)
  }
  useEffect(() => {
    if (message?.message) {
      handleOpen()
    } else {
      setMessage(null)
    }
  }, [message])
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 'none', width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh' }}>
        <Menu title={title} />
        <Outlet context={[handleOpen, handleClose, setMessage, [title, setTitle]]} />
        <Typography component='footer' variant='caption' textAlign='center'>
          Made with ❤️ by <a target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</a>. <br />
          Create your own poll in <Link component={RouterLink} to='/create'>here</Link>.
        </Typography>
      </Box>
      <Snackbar
        open={open}
        TransitionComponent={SlideTransition}
        autoHideDuration={1000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={message?.severity || 'info'}
          variant='filled'
          sx={{ width: '100%', '& .MuiAlert-message': { ':first-letter': { textTransform: 'uppercase' } } }}
        >
          {message?.message}
        </Alert>
      </Snackbar>
    </>
  )
}
function SlideTransition (props) {
  return <Slide {...props} direction='up' />
}
