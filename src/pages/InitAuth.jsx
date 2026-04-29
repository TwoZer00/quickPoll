import { Alert, Box, createTheme, CssBaseline, Dialog, DialogTitle, Divider, LinearProgress, Link, List, responsiveFontSizes, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, useNavigate, useNavigation } from 'react-router-dom'
import Menu, { PollListItem } from '../components/Menu'
import { amber, blueGrey, deepOrange } from '@mui/material/colors'
import { PropTypes } from 'prop-types'
import { getLastPolls } from '../utils/storage'

export default function InitAuth () {
  const bgColor = blueGrey[50]
  const color = blueGrey[900]
  let theme = createTheme({
    palette: {
      primary: { main: amber[700] },
      secondary: deepOrange
    }
  })
  theme = responsiveFontSizes(theme)
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState()
  const handleOpen = () => setOpen(true)
  const [title, setTitle] = useState('')
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
  const handleCloseModal = () => {
    setOpenModal(false)
  }
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 'none', width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh' }}>
          <Menu title={title} openModal={setOpenModal} />
          <a href='#main-content' style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden', zIndex: 9999 }} onFocus={(e) => { e.target.style.position = 'static'; e.target.style.width = 'auto'; e.target.style.height = 'auto' }} onBlur={(e) => { e.target.style.position = 'absolute'; e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px' }}>Skip to main content</a>
          <LinearProgress sx={{ visibility: isLoading ? 'visible' : 'hidden' }} aria-hidden={!isLoading} />
          <Suspense fallback={<Box flex={1} />}>
            <Box id='main-content' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Outlet context={[handleOpen, handleClose, setMessage, [title, setTitle], [openModal, setOpenModal]]} />
            </Box>
          </Suspense>
          <Typography component='footer' variant='caption' textAlign='center' bgcolor={bgColor} color={color} py={2}>
            Made with ❤️ by <Link color='inherit' target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</Link>. <br />
            <Link color='inherit' underline='hover' href='/pp.md'>Privacy Policy</Link> | <Link href='/tos.md' color='inherit' underline='hover'>Terms of Service</Link>
          </Typography>
        </Box>
        <LastPollsListModal open={openModal} onClose={handleCloseModal} />
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

const LastPollsListModal = ({ onClose, open }) => {
  const navigate = useNavigate()
  const polls = open ? getLastPolls() : []

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Last polls</DialogTitle>
      <Divider />
      <List sx={{ pt: 0, minWidth: 280 }}>
        {polls.map((poll) => (
          <PollListItem key={poll.id} poll={poll} onClick={() => { navigate(`/poll/${poll.id}`); onClose() }} />
        ))}
      </List>
    </Dialog>
  )
}

LastPollsListModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})
