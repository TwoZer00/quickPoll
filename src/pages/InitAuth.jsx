import { Alert, Box, createTheme, CssBaseline, Dialog, DialogTitle, Divider, LinearProgress, Link, List, responsiveFontSizes, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet, Link as RouterLink, useNavigate, useNavigation } from 'react-router-dom'
import Menu, { PollListItem } from '../components/Menu'
import { amber, blueGrey, deepOrange } from '@mui/material/colors'
import { PropTypes } from 'prop-types'

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
          <LinearProgress sx={{ visibility: isLoading ? 'visible' : 'hidden' }} />
          <Outlet context={[handleOpen, handleClose, setMessage, [title, setTitle], [openModal, setOpenModal]]} />
          <Typography component='footer' variant='caption' textAlign='center' bgcolor={bgColor} color={color} py={2}>
            Made with ❤️ by <Link color='inherit' target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</Link>. <br />
            <Link color='inherit' underline='hover' href='/pp.md'>Privacy Policy</Link> | <Link href='/tos.md' color='inherit' underline='hover'>Terms of Service</Link>
          </Typography>
        </Box>
        <LastPollsListModal data={sessionStorage.getItem('lastPolls') ? JSON.parse(sessionStorage.getItem('lastPolls')) : []} open={openModal} onClose={handleCloseModal} />
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
  const navigate = useNavigate()

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Last polls</DialogTitle>
      <Divider />
      <List sx={{ pt: 0, minWidth: 280 }}>
        {props.data?.map((poll) => (
          <PollListItem key={poll.id} poll={poll} onClick={() => { navigate(`/poll/${poll.id}`); onClose() }} />
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
