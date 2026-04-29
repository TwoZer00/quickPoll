import { Alert, Box, createTheme, CssBaseline, Dialog, DialogTitle, Divider, LinearProgress, Link, List, responsiveFontSizes, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useNavigation } from 'react-router-dom'
import Menu, { PollListItem } from '../components/Menu'
import { amber, deepOrange } from '@mui/material/colors'
import { PropTypes } from 'prop-types'
import { getLastPolls } from '../utils/storage'
import { ColorModeProvider } from '../hook/useColorMode'
import useColorMode from '../hook/useColorMode'

function buildTheme (mode) {
  const dark = mode === 'dark'
  return responsiveFontSizes(createTheme({
    palette: {
      mode,
      primary: { main: amber[700] },
      secondary: deepOrange,
      background: { default: dark ? '#121212' : '#fafafa', paper: dark ? '#1e1e1e' : '#fff' }
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 24 }
        }
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, backgroundColor: dark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)' }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 }
        }
      }
    }
  }))
}

export default function InitAuth () {
  return (
    <ColorModeProvider>
      <InitAuthInner />
    </ColorModeProvider>
  )
}

function InitAuthInner () {
  const { mode } = useColorMode()
  const theme = useMemo(() => buildTheme(mode), [mode])
  const dark = mode === 'dark'
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [message, setMessage] = useState()
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (message?.message) {
      handleOpen()
    } else {
      setMessage(null)
    }
  }, [message])

  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          display: 'flex', flexDirection: 'column', flex: 'none',
          width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh',
          background: dark
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #fff8e1 0%, #fff3e0 50%, #fce4ec 100%)',
          backgroundAttachment: 'fixed'
        }}>
          <Menu openModal={setOpenModal} />
          <a href='#main-content' style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden', zIndex: 9999 }} onFocus={(e) => { e.target.style.position = 'static'; e.target.style.width = 'auto'; e.target.style.height = 'auto' }} onBlur={(e) => { e.target.style.position = 'absolute'; e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px' }}>Skip to main content</a>
          <LinearProgress sx={{ visibility: isLoading ? 'visible' : 'hidden' }} aria-hidden={!isLoading} />
          <Suspense fallback={<Box flex={1} />}>
            <Box id='main-content' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Outlet context={{ setMessage, setOpenModal }} />
            </Box>
          </Suspense>
          <Box component='footer' sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary'>
              Made by <Link color='inherit' fontWeight={600} target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</Link>
              {' · '}
              <Link color='inherit' underline='hover' href='/pp.md'>Privacy</Link>
              {' · '}
              <Link href='/tos.md' color='inherit' underline='hover'>Terms</Link>
            </Typography>
          </Box>
        </Box>
        <LastPollsListModal open={openModal} onClose={() => setOpenModal(false)} />
        <Snackbar
          open={open}
          TransitionComponent={SlideTransition}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={message?.severity || 'info'}
            variant='filled'
            sx={{
              width: '100%',
              borderRadius: 3,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              '& .MuiAlert-message': { ':first-letter': { textTransform: 'uppercase' } }
            }}
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
      <DialogTitle fontWeight={700}>Last polls</DialogTitle>
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
