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
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            {title || 'QuickPoll'}
          </Typography>
          <Button color='inherit' component={Link} to='/' disableRipple>
            Home
          </Button>
          {
              sessionStorage.getItem('lastPolls') &&
              (
                <Button color='inherit' onClick={() => openModal(true)}>
                  Last polls
                </Button>
              )
            }
          {
            title !== 'Create Poll' && (
              <Button color='inherit' component={Link} to='/create' disableRipple>
                Create Poll
              </Button>
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}
