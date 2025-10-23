import { Alert, Box, Chip, createTheme, CssBaseline, Dialog, DialogTitle, Divider, Link, List, ListItem, ListItemButton, ListItemText, responsiveFontSizes, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import Menu from '../components/Menu'
import { amber, blueGrey, deepOrange } from '@mui/material/colors'
import { PropTypes } from 'prop-types'
import { isPollClosed } from '../utils/utils'

export default function InitAuth () {
  const bgColor = blueGrey[50]
  const color = blueGrey[900]
  let theme = createTheme({
    palette: {
      primary: amber,
      secondary: deepOrange
    }
  })
  theme = responsiveFontSizes(theme)
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
  const handleCloseModal = () => {
    setOpenModal(false)
  }
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 'none', width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh' }}>
          <Menu title={title} openModal={setOpenModal} />
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

  const handleClose = () => {
    onClose()
  }
  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Last polls created in this session</DialogTitle>
      <Divider />
      <List sx={{ pt: 0 }}>
        {props.data?.map((poll) => (
          <ListItem disableGutters key={poll.id}>
            <ListItemButton component={RouterLink} to={`/poll/${poll.id}`} onClick={handleClose}>
              <ListItemText
                primary={
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body1' noWrap>
                        {poll.title}
                      </Typography>
                      <Chip
                        label={isPollClosed(poll.createdAt) ? 'Closed' : 'Open'}
                        color={isPollClosed(poll.createdAt) ? 'error' : 'success'}
                        size='small'
                        variant='outlined'
                      />
                    </Box>
                  </>
                } secondary={
                  <>
                    <Typography variant='caption' color='text.secondary'>Created at {new Date(poll.createdAt).toLocaleString()}</Typography>
                  </>
                }
              />
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
