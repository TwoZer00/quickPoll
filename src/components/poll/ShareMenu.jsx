import { useState } from 'react'
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { BallotOutlined, BarChart as BarChartIcon, PieChart as PieChartIcon, Share } from '@mui/icons-material'
import { PropTypes } from 'prop-types'

const SHARE_OPTIONS = [
  { label: 'Share poll', param: null, icon: <BallotOutlined fontSize='small' /> },
  { label: 'Share as pie chart', param: 'pie', icon: <PieChartIcon fontSize='small' /> },
  { label: 'Share as bar chart', param: 'bars', icon: <BarChartIcon fontSize='small' /> }
]

const ShareMenu = ({ setMessage }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleShare = (param) => {
    const url = new URL(window.location.href)
    url.search = ''
    if (param) url.searchParams.set('resultsOnly', param)
    navigator.clipboard.writeText(url.toString()).then(() => setMessage({ message: 'link copied to clipboard' }))
    setAnchorEl(null)
  }

  return (
    <Box display='flex' alignSelf='end'>
      <IconButton size='small' aria-label='Share poll' onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
        <Share fontSize='inherit' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {SHARE_OPTIONS.map(({ label, param, icon }) => (
          <MenuItem key={label} onClick={() => handleShare(param)} sx={{ borderRadius: 2, mx: 0.5 }}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

ShareMenu.propTypes = {
  setMessage: PropTypes.func.isRequired
}

export default ShareMenu
