import { useEffect, useState, useRef } from 'react'
import { Box, Button, Paper, Switch, FormControlLabel, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TimeRemain from './poll/TimeRemain'
import OptionsList, { useVoteCounts } from './poll/OptionsList'

const CREATED_AT_SECONDS = Date.now() / 1000
const POLL_ID = 'mock'
const OPTIONS_WITH_IMAGES = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', title: 'JavaScript', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', title: 'Python', voted: true, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', title: 'Rust', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' },
  { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', title: 'Go', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' }
]
const OPTIONS_NO_IMAGES = OPTIONS_WITH_IMAGES.map(({ image, ...o }) => o)
const VOTE_INTERVAL_MS = 1200

// Standalone hook for mock vote counts (no Supabase)
const INITIAL_COUNTS = { 'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 3, 'b2c3d4e5-f6a7-8901-bcde-f12345678901': 5, 'c3d4e5f6-a7b8-9012-cdef-123456789012': 1, 'd4e5f6a7-b8c9-0123-defa-234567890123': 2 }

function useMockVoteCounts (options) {
  const [voteCounts, setVoteCounts] = useState(INITIAL_COUNTS)
  const bufferRef = useRef({ ...INITIAL_COUNTS })

  useEffect(() => {
    const t = setInterval(() => {
      const optionId = options[Math.floor(Math.random() * options.length)].id
      bufferRef.current = { ...bufferRef.current, [optionId]: bufferRef.current[optionId] + 1 }
      setVoteCounts({ ...bufferRef.current })
    }, VOTE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [options])

  const applyOptimistic = (prevId, newId) => {
    bufferRef.current = { ...bufferRef.current, [newId]: bufferRef.current[newId] + 1, ...(prevId ? { [prevId]: bufferRef.current[prevId] - 1 } : {}) }
    setVoteCounts({ ...bufferRef.current })
  }

  return { voteCounts, applyOptimistic, revertOptimistic: () => {} }
}

export default function PollMock () {
  const { t } = useTranslation()
  const [duration, setDuration] = useState()
  const [option, setOption] = useState(null)
  const [voted, setVoted] = useState('b2c3d4e5-f6a7-8901-bcde-f12345678901')
  const [withImages, setWithImages] = useState(false)
  const BASE_OPTIONS = withImages ? OPTIONS_WITH_IMAGES : OPTIONS_NO_IMAGES
  const { voteCounts, applyOptimistic } = useMockVoteCounts(BASE_OPTIONS)

  const poll = { id: POLL_ID, title: t('mock.title'), createdAt: { seconds: CREATED_AT_SECONDS }, closed: false }
  const options = BASE_OPTIONS.map(o => ({ ...o, voted: o.id === voted }))

  const handleVote = () => {
    if (!option) return
    applyOptimistic(voted, option)
    setVoted(option)
    setOption(null)
  }

  return (
    <Paper elevation={0} variant='outlined' sx={{ width: '100%', maxWidth: 380, overflow: 'hidden', userSelect: 'none' }}>
      <Box p={2.5} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' fontWeight={600}>{poll.title}</Typography>
          <FormControlLabel
            control={<Switch size='small' checked={withImages} onChange={e => { setWithImages(e.target.checked); setOption(null) }} />}
            label={<Typography variant='caption' color='text.secondary'>{t('mock.images')}</Typography>}
            labelPlacement='start'
            sx={{ m: 0, gap: 0.5 }}
          />
        </Box>
        <TimeRemain duration={duration} setDuration={setDuration} date={CREATED_AT_SECONDS * 1000} />
        <OptionsList
          poll={poll}
          options={options}
          option={option ?? voted}
          setOptions={() => {}}
          handleChange={(e) => setOption(e.target.value)}
          results={null}
          id={POLL_ID}
          setResults={() => {}}
          voteCounts={voteCounts}
          disableUrlSync
        />
        <Button variant='contained' color='primary' size='large' sx={{ alignSelf: 'end', px: 4 }} disabled={!option || option === voted} onClick={handleVote}>
          {t('poll.vote')}
        </Button>
      </Box>
    </Paper>
  )
}
