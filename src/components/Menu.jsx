import { AppBar, Box, Chip, Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material'
import { Add, ExpandLess, ExpandMore, History, Menu as MenuIcon } from '@mui/icons-material'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PropTypes } from 'prop-types'
import { isPollClosed } from '../utils/utils'
import { getLastPolls } from '../utils/storage'

export default function Menu ({ openModal }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const hasLastPolls = getLastPolls().length > 0
  const isCreate = location.pathname === '/create'

  return (
    <>
      <AppBar
        position='sticky' elevation={0}
        sx={{
          bgcolor: 'rgba(255,160,0,0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          mx: { xs: 1, sm: 2 },
          mt: 1,
          width: 'auto',
          boxShadow: '0 4px 24px rgba(255,160,0,0.25)',
          color: '#fff'
        }}
      >
        <Toolbar variant='dense' sx={{ gap: 1, minHeight: 48 }}>
          <Typography
            variant='subtitle1' fontWeight={800} letterSpacing={0.5} component={Link} to='/'
            sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
          >
            QuickPoll
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.75, alignItems: 'center' }}>
            {hasLastPolls && (
              <Chip
                icon={<History sx={{ color: 'inherit' }} />} label='Last polls' size='small'
                onClick={() => openModal(true)}
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                variant='outlined'
              />
            )}
            {!isCreate && (
              <Chip
                icon={<Add sx={{ color: 'inherit' }} />} label='Create Poll' size='small'
                onClick={() => navigate('/create')}
                sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' } }}
              />
            )}
          </Box>
          <IconButton aria-label='Open navigation menu' onClick={() => setDrawerOpen(true)} sx={{ display: { sm: 'none' }, color: 'inherit' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ minWidth: 200 }} role='navigation' aria-label='Main navigation'>
          <ListItemButton onClick={() => { navigate('/'); setDrawerOpen(false) }}>
            <ListItemText primary='Home' />
          </ListItemButton>
          {!isCreate && (
            <ListItemButton onClick={() => { navigate('/create'); setDrawerOpen(false) }}>
              <ListItemText primary='Create Poll' />
            </ListItemButton>
          )}
          {hasLastPolls && (
            <>
              <Divider />
              <DrawerLastPolls onNavigate={() => setDrawerOpen(false)} />
            </>
          )}
        </List>
      </Drawer>
    </>
  )
}

function DrawerLastPolls ({ onNavigate }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const polls = getLastPolls()

  return (
    <>
      <ListItemButton onClick={() => setExpanded(prev => !prev)}>
        <ListItemText primary='Last polls' />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={expanded}>
        <List disablePadding>
          {polls.map(poll => (
            <PollListItem key={poll.id} poll={poll} onClick={() => { navigate(`/poll/${poll.id}`); onNavigate() }} sx={{ pl: 3 }} />
          ))}
        </List>
      </Collapse>
    </>
  )
}

export function PollListItem ({ poll, onClick, sx }) {
  const closed = isPollClosed(poll.createdAt)
  return (
    <ListItemButton onClick={onClick} sx={{ overflow: 'hidden', ...sx }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: closed ? 'error.main' : 'success.main', mr: 1.5, flexShrink: 0 }} role='img' aria-label={closed ? 'Closed' : 'Open'} />
      <ListItemText
        sx={{ overflow: 'hidden' }}
        primary={<Typography variant='body2' noWrap>{poll.title}</Typography>}
        secondary={timeAgo(poll.createdAt)}
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

function timeAgo (timestamp) {
  const ms = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
