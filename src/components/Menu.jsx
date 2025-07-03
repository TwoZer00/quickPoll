import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

/**
 * Menu component
 * @returns {JSX.Element}
 */
export default function Menu ({ title, openModal }) {
  return (
    <Box>
      <AppBar position='sticky'>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant='h6' maxWidth='9ch' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </Typography>
          </Box>
          <Button color='inherit' component={Link} to='/' disableRipple>
            Home
          </Button>
          {
              sessionStorage.getItem('lastPolls') &&
              (
                <Button sx={{ whiteSpace: 'nowrap' }} color='inherit' onClick={() => openModal(true)} disableRipple>
                  Last polls
                </Button>
              )
            }
          {
            title !== 'Create Poll' && (
              <Button sx={{ whiteSpace: 'nowrap' }} color='inherit' component={Link} to='/create' disableRipple>
                Create Poll
              </Button>
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}
