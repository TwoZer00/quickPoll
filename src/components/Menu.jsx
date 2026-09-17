import { AppBar, Box, Button, Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu as MuiMenu, MenuItem, Toolbar, Typography } from '@mui/material'
import { Add, Close, DarkMode, ExpandLess, ExpandMore, History, Home as HomeIcon, Language, LightMode, Menu as MenuIcon, PollOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { isPollClosed } from '../utils/utils'
import { getLastPolls } from '../utils/storage'
import useColorMode from '../hook/useColorMode'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇲🇽' }
]

export default function Menu ({ openModal }) {
  const { t, i18n } = useTranslation()
  const { lang } = useParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const lastPolls = useMemo(() => getLastPolls(), [location.pathname])
  const hasLastPolls = lastPolls.length > 0
  const isCreate = location.pathname === `/${lang}/create`
  const { mode, toggle } = useColorMode()
  const [langAnchor, setLangAnchor] = useState(null)
  const currentLang = LANGUAGES.find(l => i18n.language?.startsWith(l.code)) || LANGUAGES[0]
  const changeLang = (code) => {
    i18n.changeLanguage(code)
    const newPath = location.pathname.replace(/^\/[a-z]{2}/, '/' + code)
    navigate(newPath, { replace: true })
    setLangAnchor(null)
  }

  return (
    <>
      <AppBar position='sticky' elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 52 }, px: { xs: 2, sm: 3 } }}>
          <Box component={Link} to={`/${lang}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none', color: 'text.primary', flexGrow: 1 }}>
            <PollOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant='subtitle1' fontWeight={600} letterSpacing={-0.3} color='text.primary'>
              QuickPoll
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
            {hasLastPolls && (
              <Button
                size='small' startIcon={<History fontSize='small' />}
                onClick={() => openModal(true)}
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                {t('nav.lastPolls')}
              </Button>
            )}
            {!isCreate && (
              <Button
                size='small' variant='contained' startIcon={<Add fontSize='small' />}
                onClick={() => navigate(`/${lang}/create`)}
              >
                {t('nav.createPoll')}
              </Button>
            )}
            <Button size='small' onClick={(e) => setLangAnchor(e.currentTarget)} endIcon={<ExpandMore fontSize='small' />} sx={{ color: 'text.secondary', fontWeight: 500, gap: 0.5 }}>
              <Typography variant='body2'>{currentLang.flag}</Typography>
              <Typography variant='body2'>{currentLang.code.toUpperCase()}</Typography>
            </Button>
            <MuiMenu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 140 } } }}>
              {LANGUAGES.map(l => (
                <MenuItem key={l.code} onClick={() => changeLang(l.code)} selected={currentLang.code === l.code} sx={{ borderRadius: 2, mx: 0.5, gap: 1 }}>
                  <Typography variant='body2'>{l.flag}</Typography>
                  <Typography variant='body2'>{l.label}</Typography>
                </MenuItem>
              ))}
            </MuiMenu>
            <IconButton aria-label='Toggle dark mode' onClick={toggle} sx={{ color: 'text.secondary' }} size='small'>
              {mode === 'dark' ? <LightMode fontSize='small' /> : <DarkMode fontSize='small' />}
            </IconButton>
          </Box>
          <IconButton aria-label='Open navigation menu' onClick={() => setDrawerOpen(true)} sx={{ display: { sm: 'none' }, color: 'text.secondary' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)} keepMounted PaperProps={{ sx: { minWidth: 280, maxWidth: '80vw' } }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PollOutlined sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>QuickPoll</Typography>
          </Box>
          <IconButton aria-label='Close menu' onClick={() => setDrawerOpen(false)} sx={{ minWidth: 48, minHeight: 48 }}>
            <Close />
          </IconButton>
        </Toolbar>
        <Divider />
        <List role='navigation' aria-label='Main navigation' sx={{ px: 1, py: 0.5 }}>
          <ListItemButton onClick={() => { navigate(`/${lang}`); setDrawerOpen(false) }} sx={{ borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' } }}>
            <ListItemIcon sx={{ minWidth: 40 }}><HomeIcon /></ListItemIcon>
            <ListItemText primary={t('nav.home')} />
          </ListItemButton>
          {!isCreate && (
            <ListItemButton onClick={() => { navigate(`/${lang}/create`); setDrawerOpen(false) }} sx={{ borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' } }}>
              <ListItemIcon sx={{ minWidth: 40 }}><Add /></ListItemIcon>
              <ListItemText primary={t('nav.createPoll')} />
            </ListItemButton>
          )}
          <ListItemButton onClick={() => { toggle(); setDrawerOpen(false) }} sx={{ borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' } }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{mode === 'dark' ? <LightMode /> : <DarkMode />}</ListItemIcon>
            <ListItemText primary={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')} />
          </ListItemButton>
          <Divider sx={{ my: 0.5 }} />
          {LANGUAGES.map(l => (
            <ListItemButton key={l.code} onClick={() => { changeLang(l.code); setDrawerOpen(false) }} selected={currentLang.code === l.code} sx={{ borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' } }}>
              <ListItemIcon sx={{ minWidth: 40 }}><Language /></ListItemIcon>
              <ListItemText primary={<Box sx={{ display: 'flex', gap: 1 }}><Typography variant='body2'>{l.flag}</Typography><Typography variant='body2'>{l.label}</Typography></Box>} />
            </ListItemButton>
          ))}
          {hasLastPolls && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <DrawerLastPolls onNavigate={() => setDrawerOpen(false)} />
            </>
          )}
        </List>
      </Drawer>
    </>
  )
}

function DrawerLastPolls ({ onNavigate }) {
  const { t } = useTranslation()
  const { lang } = useParams()
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const polls = getLastPolls()

  return (
    <>
      <ListItemButton onClick={() => setExpanded(prev => !prev)} sx={{ borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' } }}>
        <ListItemIcon sx={{ minWidth: 40 }}><History /></ListItemIcon>
        <ListItemText primary={t('nav.lastPolls')} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={expanded}>
        <List disablePadding>
          {polls.map(poll => (
            <PollListItem key={poll.id} poll={poll} onClick={() => { navigate(`/${lang}/poll/${poll.id}`); onNavigate() }} sx={{ pl: 3 }} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

export function PollListItem ({ poll, onClick, sx }) {
  const { t } = useTranslation()
  const closed = isPollClosed(poll.createdAt)
  return (
    <ListItemButton onClick={onClick} sx={{ overflow: 'hidden', borderRadius: 2, minHeight: 52, '&:active': { bgcolor: 'action.selected' }, ...sx }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: closed ? 'text.disabled' : 'success.main', mr: 1.5, flexShrink: 0 }} role='img' aria-label={closed ? 'Closed' : 'Open'} />
      <ListItemText
        sx={{ overflow: 'hidden' }}
        primary={<Typography variant='body2' noWrap>{poll.title}</Typography>}
        secondary={<Typography variant='caption' color='text.secondary'>{timeAgo(poll.createdAt, t)}{poll.voted ? ` · ${t('time.voted')}` : ''}</Typography>}
      />
    </ListItemButton>
  )
}

Menu.propTypes = {
  openModal: PropTypes.func.isRequired
}

DrawerLastPolls.propTypes = {
  onNavigate: PropTypes.func.isRequired
}

PollListItem.propTypes = {
  poll: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object
}

function timeAgo (timestamp, t) {
  const ms = timestamp?.seconds
    ? timestamp.seconds * 1000
    : typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return t('time.justNow')
  if (mins < 60) return t('time.minsAgo', { n: mins })
  return t('time.hoursAgo', { n: Math.floor(mins / 60) })
}
