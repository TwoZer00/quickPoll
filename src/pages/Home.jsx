import { alpha, Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { Add, BoltRounded, ShareRounded, BarChartRounded } from '@mui/icons-material'
import useTitle from '../hook/useTitle'
import PageWrapper from '../components/PageWrapper'

const features = [
  { icon: <BoltRounded />, label: 'Instant creation', desc: 'No sign-up needed' },
  { icon: <ShareRounded />, label: 'Easy sharing', desc: 'One link to share' },
  { icon: <BarChartRounded />, label: 'Real-time results', desc: 'Watch votes live' }
]

export default function Home () {
  useTitle({ title: 'Quick and easy polls', description: 'Create quick polls, share them and see results in real time.' })
  return (
    <PageWrapper sx={{ alignItems: 'center' }}>
      <Stack component='main' alignItems='center' gap={4}>
        <Typography
          variant='h2' fontWeight={800} align='center'
          sx={{
            background: 'linear-gradient(135deg, #ff6d00 0%, #ffa000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          QuickPoll
        </Typography>
        <Typography variant='h6' align='center' color='text.secondary' fontWeight={400} maxWidth='36ch'>
          Create polls in seconds, share a link, and watch votes come in live.
        </Typography>
        <Stack direction='row' gap={2} flexWrap='wrap' justifyContent='center'>
          {features.map(f => (
            <Paper
              key={f.label} elevation={0}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                px: 3, py: 2, borderRadius: 3,
                bgcolor: alpha('#ffa000', 0.06),
                border: '1px solid', borderColor: alpha('#ffa000', 0.15),
                transition: 'transform .2s, box-shadow .2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${alpha('#ffa000', 0.15)}` },
                '&:active': { transform: 'scale(0.97)' }
              }}
            >
              <Box sx={{ color: 'primary.main', fontSize: 28, display: 'flex' }}>{f.icon}</Box>
              <Typography variant='body2' fontWeight={600}>{f.label}</Typography>
              <Typography variant='caption' color='text.secondary'>{f.desc}</Typography>
            </Paper>
          ))}
        </Stack>
        <Button
          variant='contained' color='secondary' size='large' startIcon={<Add />}
          component={Link} to='/create'
          sx={{ borderRadius: 3, px: 5, py: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(255,87,34,0.3)', '&:hover': { boxShadow: '0 6px 28px rgba(255,87,34,0.4)' } }}
        >
          Create a Poll
        </Button>
      </Stack>
    </PageWrapper>
  )
}
