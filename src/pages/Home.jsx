import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { Add } from '@mui/icons-material'
import useTitle from '../hook/useTitle'
import PageWrapper from '../components/PageWrapper'

export default function Home () {
  useTitle({ title: 'Quick and easy polls', description: 'Create quick polls, share them and see results in real time.' })
  return (
    <PageWrapper sx={{ alignItems: 'center' }}>
      <Stack component='main' alignItems='center' gap={2}>
        <Typography variant='h2' fontWeight={600} align='center'>QuickPoll</Typography>
        <Typography variant='body1' align='center' color='text.secondary' maxWidth='40ch'>
          Create quick polls, share them and see the results in real time.
        </Typography>
        <Button variant='contained' color='secondary' size='large' startIcon={<Add />} component={Link} to='/create'>
          Create Poll
        </Button>
      </Stack>
    </PageWrapper>
  )
}
