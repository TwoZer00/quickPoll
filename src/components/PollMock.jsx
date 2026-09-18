import { useEffect, useState, useRef } from 'react'
import { Box, Button, Paper, Switch, FormControlLabel, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TimeRemain from './poll/TimeRemain'
import OptionsList, { useVoteCounts } from './poll/OptionsList'
import { POLL_DURATION_SECONDS } from '../const/Const'

const STORAGE_KEY = 'quickpoll_mock'
const POLL_ID = 'mock'

function loadStorage () {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {} } catch { return {} }
}

function initCreatedAt () {
  const stored = loadStorage()
  const now = Date.now() / 1000
  if (stored.createdAt && (now - stored.createdAt) < POLL_DURATION_SECONDS) return stored.createdAt
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, createdAt: now }))
  return now
}
const OPTIONS_WITH_IMAGES = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', title: 'JavaScript', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', title: 'Python', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', title: 'Rust', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' },
  { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', title: 'Go', voted: false, image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' }
]
const OPTIONS_NO_IMAGES = OPTIONS_WITH_IMAGES.map(({ image, ...o }) => o)
const VOTE_INTERVAL_MS = 1200

// Standalone hook for mock vote counts (no Supabase)
const INITIAL_COUNTS = { 'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 3, 'b2c3d4e5-f6a7-8901-bcde-f12345678901': 5, 'c3d4e5f6-a7b8-9012-cdef-123456789012': 1, 'd4e5f6a7-b8c9-0123-defa-234567890123': 2 }
// Weights based on Stack Overflow Developer Survey 2024 popularity
const WEIGHTS = { 'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 30, 'b2c3d4e5-f6a7-8901-bcde-f12345678901': 28, 'c3d4e5f6-a7b8-9012-cdef-123456789012': 22, 'd4e5f6a7-b8c9-0123-defa-234567890123': 20 }

function saveCounts (counts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadStorage(), counts }))
}

function useMockVoteCounts (options, resetKey) {
  const [voteCounts, setVoteCounts] = useState(() => ({ ...INITIAL_COUNTS, ...loadStorage().counts }))
  const bufferRef = useRef({ ...INITIAL_COUNTS, ...loadStorage().counts })

  useEffect(() => {
    bufferRef.current = { ...INITIAL_COUNTS }
    setVoteCounts({ ...INITIAL_COUNTS })
  }, [resetKey])

  useEffect(() => {
    const t = setInterval(() => {
      const remaining = POLL_DURATION_SECONDS - (Date.now() / 1000 - loadStorage().createdAt)
      if (remaining <= 0) return
      const total = options.reduce((s, o) => s + WEIGHTS[o.id], 0)
      let r = Math.random() * total
      const optionId = options.find(o => (r -= WEIGHTS[o.id]) < 0)?.id ?? options[0].id
      bufferRef.current = { ...bufferRef.current, [optionId]: bufferRef.current[optionId] + 1 }
      saveCounts(bufferRef.current)
      setVoteCounts({ ...bufferRef.current })
    }, VOTE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [options])

  const applyOptimistic = (prevId, newId) => {
    bufferRef.current = { ...bufferRef.current, [newId]: bufferRef.current[newId] + 1, ...(prevId ? { [prevId]: bufferRef.current[prevId] - 1 } : {}) }
    saveCounts(bufferRef.current)
    setVoteCounts({ ...bufferRef.current })
  }

  return { voteCounts, applyOptimistic, revertOptimistic: () => {} }
}

export default function PollMock () {
  const { t } = useTranslation()
  const [duration, setDuration] = useState()
  const [option, setOption] = useState(null)
  const [voted, setVoted] = useState(() => loadStorage().voted ?? null)
  const [viewMode, setViewMode] = useState(() => 'bars')
  const [withImages, setWithImages] = useState(false)
  const [createdAt, setCreatedAt] = useState(initCreatedAt)
  const [resetKey, setResetKey] = useState(0)
  const BASE_OPTIONS = withImages ? OPTIONS_WITH_IMAGES : OPTIONS_NO_IMAGES
  const { voteCounts, applyOptimistic } = useMockVoteCounts(BASE_OPTIONS, resetKey)

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    const t = initCreatedAt()
    setCreatedAt(t)
    setVoted(null)
    setOption(null)
    setViewMode('bars')
    setResetKey(k => k + 1)
  }

  useEffect(() => {
    if (duration === 0) handleReset()
  }, [duration])

  const poll = { id: POLL_ID, title: t('mock.title'), createdAt: { seconds: createdAt }, closed: false }
  const options = BASE_OPTIONS.map(o => ({ ...o, voted: o.id === voted }))

  const handleVote = () => {
    if (!option) return
    applyOptimistic(voted, option)
    setVoted(option)
    setViewMode('bars')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadStorage(), voted: option }))
    setOption(null)
  }

  return (
    <Paper elevation={0} variant='outlined' sx={{ width: '100%', maxWidth: 480, maxHeight: 560, overflow: 'hidden', userSelect: 'none', display: 'flex', flexDirection: 'column' }}>
      <Box p={2.5} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0 }}>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' fontWeight={600}>{poll.title}</Typography>
          <FormControlLabel
            control={<Switch size='small' checked={withImages} onChange={e => { setWithImages(e.target.checked); setOption(null) }} />}
            label={<Typography variant='caption' color='text.secondary'>{t('mock.images')}</Typography>}
            labelPlacement='start'
            sx={{ m: 0, gap: 0.5 }}
          />
        </Box>
        <TimeRemain duration={duration} setDuration={setDuration} date={createdAt * 1000} />
        <OptionsList
          poll={poll}
          options={options}
          option={option ?? voted ?? ''}
          setOptions={() => {}}
          handleChange={(e) => setOption(e.target.value)}
          results={null}
          id={POLL_ID}
          setResults={() => {}}
          voteCounts={voteCounts}
          pieSize={160}
          disableUrlSync
          initialView={viewMode}
          forceShowResult
          isVoted={!!voted}
          onViewChange={(v) => setViewMode(v)}
        />
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          {import.meta.env.DEV && (
            <Button size='small' color='inherit' sx={{ opacity: 0.5, fontSize: 12 }} onClick={handleReset}>
              {t('mock.reset')}
            </Button>
          )}
          {viewMode === 'vote' && (
            <Button variant='contained' color='primary' size='large' sx={{ px: 4 }} disabled={!option || option === voted} onClick={handleVote}>
              {t('poll.vote')}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
