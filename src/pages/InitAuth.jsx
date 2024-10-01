import { Alert, Slide, Snackbar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function InitAuth () {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState()
  const handleOpen = () => setOpen(true)
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
      <Outlet context={[handleOpen, handleClose, setMessage]} />
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
      <amp-ad
        width='100vw' height='320'
        type='adsense'
        data-ad-client='ca-pub-7731037445831235'
        data-ad-slot='5542566407'
        data-auto-format='rspv'
        data-full-width=''
      >
        <div overflow='' />
      </amp-ad>
    </>
  )
}
function SlideTransition (props) {
  return <Slide {...props} direction='up' />
}
