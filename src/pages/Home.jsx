import { Box, Button, CssBaseline, Link, Stack, ThemeProvider, Typography, createTheme } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home () {
  const theme = createTheme()
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/create')
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack direction='column' height='100dvh' width='100dvw'>
        <Box component='nav' p={1}>
          <Stack direction='row' width='100%' justifyContent='end'>
            <Button variant='contained' sx={{ widows: 'fit-content' }} onClick={handleClick}>
              Create poll
            </Button>
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
    </ThemeProvider>
  )
}
