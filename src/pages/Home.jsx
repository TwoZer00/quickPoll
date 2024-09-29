import { PropTypes } from 'prop-types'
import { Box, Button, CssBaseline, Dialog, DialogTitle, List, Link, ListItem, ListItemButton, ListItemText, Slide, Stack, ThemeProvider, Typography, createTheme } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

export default function Home () {
  const theme = createTheme()
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/create')
  }
  const [openModal, setOpenModal] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack direction='column' height='100dvh' width='100dvw'>
        <Box component='nav' p={1}>
          <Stack direction='row' width='100%' gap={1} justifyContent='end'>
            <Button variant='contained' onClick={handleClick}>
              Create poll
            </Button>
            {
              sessionStorage.getItem('lastPolls') &&
              (
                <Button variant='contained' onClick={() => setOpenModal(true)}>
                  Last polls
                </Button>
              )
            }
          </Stack>
        </Box>
        <Box component='main' flex={1} display='flex' justifyContent='center' flexDirection='column' alignItems='center'>
          <Typography variant='h1'>QuickPoll</Typography>
          <Typography variant='body1'>Create quick poll, share it and see the results in realt time.</Typography>
        </Box>
        <Box component='footer' display='flex' flexDirection='column' alignItems='center'>
          <Typography variant='body1'>QuickPoll © {(new Date().getFullYear())} <Link href='https://twozer00.dev' target='_blank'>TwoZer00</Link></Typography>
          <Typography variant='body1'>All rights reserved.</Typography>
        </Box>
      </Stack>
      <LastPollsListModal data={sessionStorage.getItem('lastPolls') ? JSON.parse(sessionStorage.getItem('lastPolls')) : []} open={openModal} onClose={() => { setOpenModal(false) }} />
    </ThemeProvider>
  )
}

const LastPollsListModal = (props) => {
  const { onClose, open } = props

  const handleClose = () => {
    onClose()
  }
  return (
    <Dialog onClose={handleClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Last polls created in this session</DialogTitle>
      <List sx={{ pt: 0 }}>
        {props.data?.map((poll) => (
          <ListItem disableGutters key={poll.author}>
            <ListItemButton component={RouterLink} to={`/${poll.id}`}>
              <ListItemText primary={poll.title} secondary={(new Date(poll.createdAt)).toLocaleString()} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}

LastPollsListModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired
}

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})
