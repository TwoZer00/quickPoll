import { Box, Stack, Typography } from '@mui/material'
import useTitle from '../hook/useTitle'

export default function Home () {
  useTitle({ title: 'QuickPoll - Create your polls, share it and see the results' })
  return (
    <>
      <Stack direction='column' height='100dvh' width='100dvw'>
        <Box component='main' flex={1} display='flex' justifyContent='center' flexDirection='column' alignItems='center'>
          <Typography variant='h1' fontWeight={500}>QuickPoll</Typography>
          <Typography variant='body1'>Create quick poll, share it and see the results in realt time.</Typography>
        </Box>
      </Stack>
    </>
  )
}
