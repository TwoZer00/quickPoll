import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import React from 'react'
/**
 * Menu component
 * @returns {JSX.Element}
 */
export default function Menu ({ title }) {
  return (
    <Box>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            {title || 'QuickPoll'}
          </Typography>
          <Button color='inherit' component={Link} to='/'>
            Home
          </Button>
          {
            title !== 'Create Poll' && (
              <Button color='inherit' component={Link} to='/poll/create'>
                Create Poll
              </Button>
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}
