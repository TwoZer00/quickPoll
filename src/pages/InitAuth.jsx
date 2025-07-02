import { Alert, Box, createTheme, CssBaseline, Dialog, DialogTitle, Link, List, ListItem, ListItemButton, ListItemText, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import Menu from '../components/Menu'
import { amber, blueGrey, deepOrange } from '@mui/material/colors'
import { PropTypes } from 'prop-types'

export default function InitAuth () {
  const bgColor = blueGrey[50]
  const color = blueGrey[900]
  const theme = createTheme({
    palette: {
      primary: amber,
      secondary: deepOrange
    }
  })
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 'none', width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh' }}>
          <Menu title={title} openModal={setOpenModal} />
          <Outlet context={[handleOpen, handleClose, setMessage, [title, setTitle], [openModal, setOpenModal]]} />
          <Typography component='footer' variant='caption' textAlign='center' bgcolor={bgColor} color={color} py={2}>
            Made with ❤️ by <Link color='inherit' target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</Link>. <br />
            <Link component={RouterLink} to='/privacy' color='inherit' underline='hover'>Privacy Policy</Link> | <Link component={RouterLink} to='/terms' color='inherit' underline='hover'>Terms of Service</Link>
          </Typography>
        </Box>
        <LastPollsListModal data={sessionStorage.getItem('lastPolls') ? JSON.parse(sessionStorage.getItem('lastPolls')) : []} open={openModal} onClose={() => { setOpenModal(false) }} />
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
      </ThemeProvider>
    </>
  )
}
function SlideTransition (props) {
  return <Slide {...props} direction='up' />
}

const LastPollsListModal = (props) => {
  const { onClose, open } = props

  const handleClose = () => {
    onClose()
  }
  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Last polls created in this session</DialogTitle>
      <List sx={{ pt: 0 }}>
        {props.data?.map((poll) => (
          <ListItem disableGutters key={poll.author}>
            <ListItemButton component={RouterLink} to={`/poll/${poll.id}`}>
              <ListItemText primary={poll.title} secondary={(new Date(poll.createdAt)).toLocaleString()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}

LastPollsListModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired
}

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})
