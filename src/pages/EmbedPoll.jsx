import { useLoaderData, useParams } from 'react-router-dom'
import { Box, Button, LinearProgress, Link as MuiLink, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getResults, setVote, requestStateEnum } from '../supabase/utils'
import dayjs from 'dayjs'
import GoogleAd from '../components/GoogleAd'
import useTitle from '../hook/useTitle'
import OptionsList, { useVoteCounts } from '../components/poll/OptionsList'
import TimeRemain from '../components/poll/TimeRemain'
import { OpenInNew } from '@mui/icons-material'
import { track } from '../utils/analytics'

export default function EmbedPoll () {
  const [data, setData] = useState(useLoaderData())
  const { t } = useTranslation()
  const [state, setState] = useState()
  const [options, setOptions] = useState(data.options)
  const [option, setOption] = useState(options.find(o => o.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const [duration, setDuration] = useState()
  const [message, setMessage] = useState()
  const { id } = useParams()
  const { voteCounts, applyOptimistic, revertOptimistic } = useVoteCounts(id, options)
  useTitle({ title: `QuickPoll - ${data?.title}`, description: `Vote on: ${data?.title}` })

  useEffect(() => {
    if (data.closed && options.find(o => o.voted)?.id === option) {
      getResults(id, options).then(setResults)
    }
  }, [data, id, option, options])

  const handleSubmit = (event) => {
    setState(requestStateEnum.pending)
    event.preventDefault()
    const selectedOption = new FormData(event.currentTarget).get('radio-buttons-group')
    const lastVote = options.find(o => o.voted)
    applyOptimistic(lastVote?.id, selectedOption)
    setVote({ lastVote, voteId: selectedOption, pollId: id })
      .then(() => {
        setOptions(options.map(o => ({ ...o, voted: o.id === selectedOption })))
        setOption(selectedOption)
        track('poll_voted', { pollId: id, embed: true })
        setMessage({ text: t('poll.vote'), severity: 'success' })
        setState(requestStateEnum.success)
      }).catch((error) => {
        revertOptimistic(lastVote?.id, selectedOption)
        setMessage({ text: t(`errors.${error.code}`) || error.message, severity: 'error' })
        setState(requestStateEnum.error)
      })
  }

  useEffect(() => {
    if (duration <= 0) setData(v => ({ ...v, closed: true }))
  }, [duration])

  useEffect(() => {
    if (data?.closed && !isVoted) setOption('-1')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const isVoted = useMemo(() => options.some(o => o.voted), [options])
  const pollUrl = `${window.location.origin}/${t('lang') || 'en'}/poll/${id}`

  return (
    <Stack sx={{ p: 1.5, gap: 1.5, minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box component={Paper} variant='outlined' elevation={0} sx={{ overflow: 'hidden' }}>
        <Box component='form' onSubmit={handleSubmit}>
          <Box component='main' p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Stack direction='row' alignItems='flex-start' justifyContent='space-between' gap={1}>
              {data?.title
                ? <Typography variant='h6' component='h1' fontWeight={700} sx={{ wordBreak: 'break-word' }}>{data.title}</Typography>
                : <Skeleton variant='text' height={28} width='60%' />}
              <MuiLink href={pollUrl} target='_blank' rel='noreferrer' underline='none' flexShrink={0}>
                <Button size='small' endIcon={<OpenInNew fontSize='small' />} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  QuickPoll
                </Button>
              </MuiLink>
            </Stack>
            {!data?.closed
              ? <TimeRemain duration={duration} setDuration={setDuration} date={data?.createdAt?.seconds * 1000} />
              : <Typography variant='caption' color='text.secondary'>{t('poll.created', { date: dayjs(data.createdAt.seconds * 1000).format('DD/MM/YYYY HH:mm') })}</Typography>}
            <OptionsList poll={{ ...data, id }} options={options} option={option} setOptions={setOptions} handleChange={(e) => setOption(e.target.value)} results={results} id={id} setResults={setResults} voteCounts={voteCounts} />
            {!data?.closed && (
              <Button
                type='submit' variant='contained' size='large'
                sx={{ alignSelf: 'end', px: 4 }}
                disabled={!data || options.find(o => o.voted)?.id === option || state === requestStateEnum.pending}
              >
                {t('poll.vote')}
              </Button>
            )}
            {data?.closed && <Typography variant='body2' color='text.secondary' align='center'>{t('poll.closed')}</Typography>}
            {message && (
              <Typography variant='caption' color={message.severity === 'error' ? 'error' : 'success.main'}>
                {message.text}
              </Typography>
            )}
          </Box>
          <LinearProgress variant='indeterminate' sx={{ visibility: state === requestStateEnum.pending ? 'visible' : 'hidden' }} />
        </Box>
      </Box>
      <Box className='ad-wrapper'>
        <GoogleAd adSlot='3837806330' />
      </Box>
    </Stack>
  )
}
