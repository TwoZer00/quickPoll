import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { Add, BoltRounded, ShareRounded, BarChartRounded } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import useTitle from '../hook/useTitle'
import PageWrapper from '../components/PageWrapper'
import PollMock from '../components/PollMock'

export default function Home () {
  const { t } = useTranslation()
  const { lang } = useParams()
  useTitle({ title: t('home.title'), description: t('home.subtitle') })

  const features = [
    { icon: <BoltRounded />, label: t('home.features.instant.label'), desc: t('home.features.instant.desc') },
    { icon: <ShareRounded />, label: t('home.features.sharing.label'), desc: t('home.features.sharing.desc') },
    { icon: <BarChartRounded />, label: t('home.features.results.label'), desc: t('home.features.results.desc') }
  ]

  return (
    <PageWrapper maxWidth='md' sx={{ alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'center' } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 5, md: 8 }, width: '100%' }}>
        <Stack component='main' gap={3} flex={1}>
          <Stack gap={1}>
            <Typography variant='h4' fontWeight={700}>{t('home.title')}</Typography>
            <Typography variant='body1' color='text.secondary' maxWidth='38ch'>
              {t('home.subtitle')}
            </Typography>
          </Stack>
          <Box>
            <Button
              variant='contained' size='large' startIcon={<Add />}
              component={Link} to={`/${lang}/create`}
              sx={{ px: 3, py: 1 }}
            >
              {t('home.createBtn')}
            </Button>
          </Box>
          <Divider />
          <Stack direction='row' gap={3} flexWrap='wrap' justifyContent={{ xs: 'center', md: 'flex-start' }}>
            {features.map(f => (
              <Stack key={f.label} direction='row' alignItems='center' gap={1} >
                <Box sx={{ color: 'primary.main', display: 'flex', fontSize: 18 }}>{f.icon}</Box>
                <Stack>
                  <Typography variant='caption' fontWeight={600} color='text.primary' lineHeight={1.2}>{f.label}</Typography>
                  <Typography variant='caption' color='text.secondary'>{f.desc}</Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: { xs: '100%', md: 'auto' } }}>
          <PollMock />
        </Box>
      </Box>
    </PageWrapper>
  )
}
