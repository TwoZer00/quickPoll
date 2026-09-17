import { useLoaderData, useOutletContext, useParams } from 'react-router-dom'
import { Box, Button, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getResults, setVote, requestStateEnum } from '../supabase/utils'
import dayjs from 'dayjs'
import GoogleAd from '../components/GoogleAd'
import useTitle from '../hook/useTitle'
import ShareMenu from '../components/poll/ShareMenu'
import OptionsList, { useVoteCounts } from '../components/poll/OptionsList'
import TimeRemain from '../components/poll/TimeRemain'
import PageWrapper from '../components/PageWrapper'
import { track } from '../utils/analytics'

export default function Poll () {
  const [data, setData] = useState((useLoaderData()))
  const { t } = useTranslation()
  const { setMessage } = useOutletContext()
  const [state, setState] = useState()
  const [options, setOptions] = useState(data.options)
  const [option, setOption] = useState(options.find(option => option.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const [duration, setDuration] = useState()
  const { id } = useParams()
  const { voteCounts, applyOptimistic, revertOptimistic } = useVoteCounts(id, options)
  useTitle({ title: `QuickPoll - ${data?.title}` || 'QuickPoll - Poll', description: `Vote on: ${data?.title}` })

  useEffect(() => {
    const getData = async () => {
      if (options.find(option => option.voted)?.id === option) {
        const results = await getResults(id, options)
        setResults(() => {
          return results
        })
      }
    }
    if (data.closed) getData()
  }, [data, id, option, options])
  const handleSubmit = (event) => {
    setState(requestStateEnum.pending)
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const selectedOption = formData.get('radio-buttons-group')
    const lastVote = options.find(option => option.voted)
    applyOptimistic(lastVote?.id, selectedOption)
    setVote({ lastVote, voteId: selectedOption, pollId: id })
      .then(() => {
        setOptions(options.map(o => ({ ...o, voted: o.id === selectedOption })))
        setOption(selectedOption)
        track('poll_voted', { pollId: id })
        setMessage({ message: t('poll.vote'), severity: 'success' })
        setState(requestStateEnum.success)
      }).catch((error) => {
        revertOptimistic(lastVote?.id, selectedOption)
        setMessage({ message: t(`errors.${error.code}`) || error.message, severity: 'error' })
        setState(requestStateEnum.error)
      })
  }
  useEffect(() => {
    if (duration <= 0) {
      setData((value) => { return { ...value, closed: true } })
    }
  }, [duration])
  useEffect(() => {
    if (data?.closed) {
      !isVoted && setOption('-1')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const isVoted = useMemo(() => options.some(o => o.voted), [options])

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Stack flex={1} justifyContent='center' alignItems='center' sx={{ flexDirection: { xs: 'column', lg: 'row' }, gap: 2, p: 2 }}>
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, maxWidth: 300, width: '100%' }} className='ad-wrapper'>
            <GoogleAd adSlot='3837806330' />
          </Box>
          <PageWrapper maxWidth='md' sx={{ p: 0 }}>
            <Box component='form' onSubmit={handleSubmit} width='100%'>
              <Box component={Paper} width='100%' variant='outlined' elevation={0} sx={{ overflow: 'hidden' }}>
              <Box component='main' p={2.5} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <ShareMenu setMessage={setMessage} poll={data} options={options} voteCounts={voteCounts} />
                {
                data?.title
                  ? <Typography variant='h4' component='h1' fontWeight={700} title={data?.title} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word' }}>{data?.title}</Typography>
                  : <Skeleton variant='text' height={32} width='12ch' />
              }
                {data?.user && <Typography variant='body2' color='text.secondary'>{t('poll.by', { name: data.user.name })}</Typography>}
                {!data?.closed
                  ? (
                    <TimeRemain duration={duration} setDuration={setDuration} date={data && data?.createdAt?.seconds * 1000} />
                    )
                  : (
                    <Typography variant='caption' color='text.secondary'>
                      {t('poll.created', { date: dayjs(data.createdAt.seconds * 1000).format('DD/MM/YYYY HH:mm') })}
                    </Typography>
                    )}
                <OptionsList poll={{ ...data, id }} options={options} option={option} setOptions={setOptions} handleChange={(event) => setOption(event.target.value)} results={results} id={id} setResults={setResults} voteCounts={voteCounts} />
                {!data?.closed && (
                  <Button
                    type='submit' variant='contained' color='primary' size='large'
                    sx={{ alignSelf: 'end', px: 4 }}
                    disabled={!data || (options.find(option => option.voted)?.id === option || state === requestStateEnum.pending)}
                  >
                    {t('poll.vote')}
                  </Button>
                )}
                {data?.closed && <Typography variant='body2' color='text.secondary' align='center'>{t('poll.closed')}</Typography>}
              </Box>
              <LinearProgress variant='indeterminate' sx={{ visibility: state === requestStateEnum.pending ? 'visible' : 'hidden' }} />
            </Box>
          </Box>
          </PageWrapper>
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, maxWidth: 300, width: '100%' }} className='ad-wrapper'>
            <GoogleAd adSlot='5542566407' />
          </Box>
        </Stack>
      </Box>
    </>
  )
}
