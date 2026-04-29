import { AppBar, Box, Button, Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material'
import { ExpandLess, ExpandMore, Menu as MenuIcon } from '@mui/icons-material'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isPollClosed } from '../utils/utils'

export default function Menu ({ title, openModal }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const hasLastPolls = !!sessionStorage.getItem('lastPolls')
  const showCreate = title !== 'Create Poll'

  return (
    <>
      <AppBar position='sticky' elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button color='inherit' component={Link} to='/' disableRipple size='small'>Home</Button>
            {hasLastPolls && (
              <Button sx={{ whiteSpace: 'nowrap' }} color='inherit' onClick={() => openModal(true)} disableRipple size='small'>Last polls</Button>
            )}
            {showCreate && (
              <Button sx={{ whiteSpace: 'nowrap' }} color='inherit' component={Link} to='/create' disableRipple size='small'>Create Poll</Button>
            )}
          </Box>
          <IconButton color='inherit' onClick={() => setDrawerOpen(true)} sx={{ display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ minWidth: 200 }}>
          <ListItemButton onClick={() => { navigate('/'); setDrawerOpen(false) }}>
            <ListItemText primary='Home' />
          </ListItemButton>
          {showCreate && (
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
  const polls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')

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
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: closed ? 'error.main' : 'success.main', mr: 1.5, flexShrink: 0 }} />
      <ListItemText
        sx={{ overflow: 'hidden' }}
        primary={<Typography variant='body2' noWrap>{poll.title}</Typography>}
        secondary={timeAgo(poll.createdAt)}
      />
    </ListItemButton>
  )
}

function timeAgo (timestamp) {
  const ms = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
