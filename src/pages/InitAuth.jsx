import { Alert, Box, createTheme, CssBaseline, Dialog, DialogTitle, Divider, Link as MuiLink, List, responsiveFontSizes, Slide, Snackbar, ThemeProvider, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useNavigation, useLocation, useParams } from 'react-router-dom'
import Menu, { PollListItem } from '../components/Menu'
import QuickPollLogo from '../components/QuickPollLogo'
import { indigo } from '@mui/material/colors'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase/init'
import { ColorModeProvider } from '../hook/useColorMode'
import useColorMode from '../hook/useColorMode'
import useServiceStatus from '../hook/useServiceStatus'
import { getLastPolls } from '../utils/storage'

function buildTheme (mode) {
  const dark = mode === 'dark'
  return responsiveFontSizes(createTheme({
    palette: {
      mode,
      primary: { main: indigo[600] },
      secondary: { main: indigo[400] },
      background: { default: dark ? '#0a0a0a' : '#f5f5f5', paper: dark ? '#111111' : '#ffffff' }
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h2: { fontWeight: 700, letterSpacing: -1 },
      h4: { fontWeight: 600, letterSpacing: -0.5 },
      h5: { fontWeight: 600 },
      button: { fontWeight: 500 }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500, borderRadius: 6, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 8 }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 10, backgroundImage: 'none' }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 6 }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, borderRadius: 6 }
        }
      },
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
  const { t } = useTranslation()
  const { lang } = useParams()
  const { mode } = useColorMode()
  const theme = useMemo(() => buildTheme(mode), [mode])
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

  const isFirstLoad = !sessionStorage.getItem('app_loaded')
  const [authReady, setAuthReady] = useState(!isFirstLoad)
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  useEffect(() => {
    if (!isFirstLoad) return
    Promise.all([
      supabase.auth.getSession(),
      new Promise(r => setTimeout(r, 4000))
    ]).then(() => {
      sessionStorage.setItem('app_loaded', '1')
      setAuthReady(true)
    })
  }, [])
  const location = useLocation()

  useEffect(() => {
    if (import.meta.env.PROD) window.umami?.track({ url: location.pathname, referrer: document.referrer })
  }, [location.pathname])

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!authReady
          ? <Box sx={{ display: 'flex', width: '100dvw', height: '100dvh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
              <QuickPollLogo size='lg' loading />
            </Box>
          : <Box sx={{
              display: 'flex', flexDirection: 'column', flex: 'none',
              width: '100dvw', maxWidth: '100dvw', height: '100dvh', maxHeight: '100dvh',
              bgcolor: 'background.default', overflow: 'hidden'
            }}>
              <Menu openModal={setOpenModal} />
              <StatusBanner />
              <a href='#main-content' style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden', zIndex: 9999 }} onFocus={(e) => { e.target.style.position = 'static'; e.target.style.width = 'auto'; e.target.style.height = 'auto' }} onBlur={(e) => { e.target.style.position = 'absolute'; e.target.style.left = '-9999px'; e.target.style.width = '1px'; e.target.style.height = '1px' }}>Skip to main content</a>
              {isLoading
                ? <Box flex={1} display='flex' alignItems='center' justifyContent='center'><QuickPollLogo size='lg' spinner /></Box>
                : <Suspense fallback={<Box flex={1} />}>
                    <Box id='main-content' sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      <Outlet context={{ setMessage, setOpenModal }} />
                    </Box>
                  </Suspense>
              }
              <Box component='footer' sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
                <Typography variant='caption' color='text.secondary'>
                  {t('footer.madeBy')} <MuiLink color='inherit' fontWeight={600} target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</MuiLink>
                  {' · '}
                  <MuiLink component={Link} to={`/${lang}/privacy`} color='inherit' underline='hover'>{t('privacy.pageTitle')}</MuiLink>
                  {' · '}
                  <MuiLink component={Link} to={`/${lang}/terms`} color='inherit' underline='hover'>{t('terms.pageTitle')}</MuiLink>
                </Typography>
              </Box>
            </Box>
        }
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

function StatusBanner () {
  const { t } = useTranslation()
  const status = useServiceStatus()
  if (status !== 'down') return null
  return (
    <Box sx={{ bgcolor: 'error.main', px: 2, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff', flexShrink: 0 }} />
      <Typography variant='caption' sx={{ color: '#fff', fontWeight: 500 }}>
        {t('status.banner')}
      </Typography>
    </Box>
  )
}

function SlideTransition (props) {
  return <Slide {...props} direction='up' />
}

const LastPollsListModal = ({ onClose, open }) => {
  const { t } = useTranslation()
  const { lang } = useParams()
  const navigate = useNavigate()
  const polls = open ? getLastPolls() : []

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition}>
      <DialogTitle fontWeight={700}>{t('nav.lastPolls')}</DialogTitle>
      <Divider />
      <List sx={{ pt: 0, minWidth: 280 }}>
        {polls.map((poll) => (
          <PollListItem key={poll.id} poll={poll} onClick={() => { navigate('/' + lang + '/poll/' + poll.id); onClose() }} />
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
