import { useState } from 'react'
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { BallotOutlined, BarChart as BarChartIcon, PieChart as PieChartIcon, Share, ContentCopy, Download } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { exportCSV } from '../../utils/export'

const XIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
)

const WhatsAppIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
  </svg>
)

const COPY_OPTIONS = [
  { label: 'Copy poll link', param: null, icon: <ContentCopy fontSize='small' /> },
  { label: 'Copy as pie chart', param: 'pie', icon: <PieChartIcon fontSize='small' /> },
  { label: 'Copy as bar chart', param: 'bars', icon: <BarChartIcon fontSize='small' /> }
]

const ShareMenu = ({ setMessage, poll, options, voteCounts }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const dataReady = Object.keys(voteCounts).length === options.length && Object.values(voteCounts).reduce((a, b) => a + b, 0) > 0

  const getUrl = (param) => {
    const url = new URL(window.location.href)
    url.search = ''
    if (param) url.searchParams.set('resultsOnly', param)
    return url.toString()
  }

  const handleCopy = (param) => {
    navigator.clipboard.writeText(getUrl(param)).then(() => setMessage({ message: 'link copied to clipboard' }))
    setAnchorEl(null)
  }

  const handleSocial = (platform) => {
    const url = getUrl()
    const text = 'Vote on this poll!'
    const links = {
      x: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer')
    setAnchorEl(null)
  }

  return (
    <Box display='flex' alignSelf='end' gap={0.5}>
      {dataReady && (
        <IconButton aria-label='Download CSV' onClick={() => exportCSV(poll?.title || 'poll', options, voteCounts)} sx={{ minWidth: 48, minHeight: 48, '&:hover': { bgcolor: 'action.hover' } }}>
          <Download fontSize='inherit' />
        </IconButton>
      )}
      <IconButton aria-label='Share poll' onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ minWidth: 48, minHeight: 48, '&:hover': { bgcolor: 'action.hover' } }}>
        <Share fontSize='inherit' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        {COPY_OPTIONS.map(({ label, param, icon }) => (
          <MenuItem key={label} onClick={() => handleCopy(param)} sx={{ borderRadius: 2, mx: 0.5 }}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => handleSocial('x')} sx={{ borderRadius: 2, mx: 0.5 }}>
          <ListItemIcon><XIcon /></ListItemIcon>
          <ListItemText>Share on X</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocial('whatsapp')} sx={{ borderRadius: 2, mx: 0.5 }}>
          <ListItemIcon><WhatsAppIcon /></ListItemIcon>
          <ListItemText>Share on WhatsApp</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

ShareMenu.propTypes = {
  setMessage: PropTypes.func.isRequired,
  poll: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default ShareMenu
