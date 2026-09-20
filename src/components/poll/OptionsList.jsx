import { useMemo, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Chip, RadioGroup, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { BallotOutlined, DonutLarge, BarChart as BarChartIcon, HowToVote } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabase/init'
import { assignColors } from '../../utils/color'
import Option from './Option'
import PieChartView from '../charts/PieChartView'
import BarChartView from '../charts/BarChartView'
import FadeScroll from '../FadeScroll'

const VALID_VIEWS = ['vote', 'bars', 'pie']
const DEBOUNCE_MS = 300

export function useVoteCounts (pollId, options) {
  const [voteCounts, setVoteCounts] = useState({})
  const bufferRef = useRef({})
  const timerRef = useRef(null)
  const optionsRef = useRef(options)
  const localDeltaRef = useRef({})

  useEffect(() => { optionsRef.current = options }, [options])

  useEffect(() => {
    if (!pollId || !options.length) return
    supabase.from('votes').select('option_id').eq('poll_id', pollId).then(({ data }) => {
      if (!data) return
      const counts = {}
      optionsRef.current.forEach(o => { counts[o.id] = 0 })
      data.forEach(v => { if (counts[v.option_id] !== undefined) counts[v.option_id]++ })
      setVoteCounts(counts)
      bufferRef.current = counts
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId])

  useEffect(() => {
    if (!pollId) return

    const flush = () => {
      const pending = { ...bufferRef.current }
      setVoteCounts(prev => {
        const hasChanges = Object.keys(pending).some(k => prev[k] !== pending[k])
        return hasChanges ? { ...prev, ...pending } : prev
      })
    }

    const channel = supabase.channel(`votes:${pollId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` }, (payload) => {
        const newOptId = payload.new?.option_id
        const oldOptId = payload.old?.option_id

        // skip if this event matches a pending local optimistic update
        if (payload.eventType === 'UPDATE' && localDeltaRef.current[newOptId]) {
          delete localDeltaRef.current[newOptId]
          return
        }
        if (payload.eventType === 'INSERT' && localDeltaRef.current[newOptId]) {
          delete localDeltaRef.current[newOptId]
          return
        }

        if (payload.eventType === 'UPDATE') {
          bufferRef.current[oldOptId] = (bufferRef.current[oldOptId] ?? 1) - 1
          bufferRef.current[newOptId] = (bufferRef.current[newOptId] ?? 0) + 1
        } else if (payload.eventType === 'INSERT') {
          bufferRef.current[newOptId] = (bufferRef.current[newOptId] ?? 0) + 1
        } else if (payload.eventType === 'DELETE') {
          bufferRef.current[oldOptId] = (bufferRef.current[oldOptId] ?? 1) - 1
        }
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(flush, DEBOUNCE_MS)
      })
      .subscribe()

    return () => {
      clearTimeout(timerRef.current)
      supabase.removeChannel(channel)
    }
  }, [pollId])

  const refresh = async () => {
    const { data } = await supabase.from('votes').select('option_id').eq('poll_id', pollId)
    if (!data) return
    const counts = {}
    optionsRef.current.forEach(o => { counts[o.id] = 0 })
    data.forEach(v => { if (counts[v.option_id] !== undefined) counts[v.option_id]++ })
    bufferRef.current = counts
    setVoteCounts(counts)
  }

  const applyOptimistic = (oldId, newId) => {
    // mark as pending so realtime event for this vote is ignored
    localDeltaRef.current[newId] = true
    bufferRef.current = { ...bufferRef.current }
    if (oldId) bufferRef.current[oldId] = (bufferRef.current[oldId] ?? 1) - 1
    bufferRef.current[newId] = (bufferRef.current[newId] ?? 0) + 1
    setVoteCounts({ ...bufferRef.current })
  }

  const revertOptimistic = (oldId, newId) => {
    delete localDeltaRef.current[newId]
    bufferRef.current = { ...bufferRef.current }
    if (oldId) bufferRef.current[oldId] = (bufferRef.current[oldId] ?? 0) + 1
    bufferRef.current[newId] = (bufferRef.current[newId] ?? 1) - 1
    setVoteCounts({ ...bufferRef.current })
  }

  return { voteCounts, applyOptimistic, revertOptimistic, refresh }
}

const OptionsList = ({ poll, handleChange, option, options, voteCounts, disableUrlSync = false, initialView, forceShowResult = false, isVoted = false, onViewChange, pieSize }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const paramView = searchParams.get('resultsOnly')?.toLowerCase()
  const preview = import.meta.env.DEV && searchParams.get('preview') === '1'
  const [viewMode, setViewMode] = useState(VALID_VIEWS.includes(paramView) ? paramView : initialView ?? (poll.closed ? 'bars' : 'vote'))
  const total = useMemo(() => Object.values(voteCounts).reduce((a, b) => a + b, 0), [voteCounts])
  const coloredOptions = useMemo(() => assignColors(options), [options])
  const showResult = preview || forceShowResult || coloredOptions.some(option => option.voted) || poll.closed
  const dataReady = Object.keys(voteCounts).length === coloredOptions.length
  const hasImages = coloredOptions.some(opt => opt.image)

  const pctMap = useMemo(() => {
    if (total === 0) return {}
    const raws = coloredOptions.map(o => ({ id: o.id, exact: (voteCounts[o.id] || 0) / total * 100 }))
    const floored = raws.map(o => ({ ...o, floor: Math.floor(o.exact), remainder: o.exact - Math.floor(o.exact) }))
    let remaining = 100 - floored.reduce((s, o) => s + o.floor, 0)
    floored.sort((a, b) => b.remainder - a.remainder)
    floored.forEach(o => { if (remaining-- > 0) o.floor++ })
    return Object.fromEntries(floored.map(o => [o.id, o.floor]))
  }, [coloredOptions, voteCounts, total])
  const cols = options.length <= 2 ? 2 : options.length === 3 ? 3 : options.length <= 6 ? 3 : 4

  const [pieMounted, setPieMounted] = useState(false)
  const [barsMounted, setBarsMounted] = useState(false)

  useEffect(() => {
    if (viewMode === 'pie' && !pieMounted) {
      const raf = requestAnimationFrame(() => setPieMounted(true))
      return () => cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  useEffect(() => {
    if (viewMode === 'bars' && !barsMounted) {
      const raf = requestAnimationFrame(() => setBarsMounted(true))
      return () => cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  const handleViewChange = (_, v) => {
    if (!v) return
    setViewMode(v)
    onViewChange?.(v)
    if (!disableUrlSync) {
      setSearchParams(prev => {
        if (v === 'vote') { prev.delete('resultsOnly') } else { prev.set('resultsOnly', v) }
        return prev
      }, { replace: true })
    }
  }

  return (
    <>
      {showResult && total > 0 && (
        <Stack direction='row' alignItems='center' justifyContent='space-between' gap={1} flexWrap='wrap' sx={{ px: 2.5, pt: 1.5, pb: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Chip icon={<HowToVote fontSize='small' />} label={<Typography variant='caption' fontWeight={600}>{total}</Typography>} size='small' variant='outlined' />
          <ToggleButtonGroup
            size='small' value={viewMode} exclusive onChange={handleViewChange}
            sx={{ gap: 1, '& .MuiToggleButton-root': { borderRadius: '20px !important', px: 2, minWidth: 48, minHeight: 48, border: '1px solid', borderColor: 'divider' } }}
            aria-label='Results view'
          >
            {!poll.closed && (
              <ToggleButton
                value='vote'
                aria-label='Vote view'
                sx={!isVoted && forceShowResult && viewMode !== 'vote' ? {
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    animation: 'ringPulse 1.5s ease-out infinite',
                  },
                  '@keyframes ringPulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.8 },
                    '100%': { transform: 'scale(1.6)', opacity: 0 }
                  }
                } : {}}
              >
                <BallotOutlined fontSize='small' />
              </ToggleButton>
            )}
            <ToggleButton value='bars' aria-label='Bar chart'><BarChartIcon fontSize='small' /></ToggleButton>
            <ToggleButton value='pie' aria-label='Pie chart'><DonutLarge fontSize='small' /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
      <FadeScroll snap={viewMode === 'vote'} sx={{ px: 2.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <OptionsContent viewMode={viewMode} coloredOptions={coloredOptions} poll={poll} option={option} handleChange={handleChange} voteCounts={voteCounts} total={total} showResult={showResult} dataReady={dataReady} pieMounted={pieMounted} barsMounted={barsMounted} pctMap={pctMap} pieSize={pieSize} />
      </FadeScroll>
    </>
  )
}

function OptionsContent ({ viewMode, coloredOptions, poll, option, handleChange, voteCounts, total, showResult, dataReady, pieMounted, barsMounted, pctMap, pieSize }) {
  const hasImages = coloredOptions.some(opt => opt.image)
  return (
    <>
      <Box sx={{ display: viewMode === 'vote' ? 'block' : 'none' }}>
        <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {coloredOptions.map((opt) => (
            <Option key={opt.id} poll={poll} option={opt} voteCount={voteCounts[opt.id] || 0} total={total} showResult={showResult} cardMode={hasImages} selected={option} pctValue={pctMap[opt.id]} />
          ))}
        </RadioGroup>
      </Box>
      {!dataReady && viewMode === 'pie' && (
        <Box display='flex' justifyContent='center' alignItems='center' height={200}><Skeleton variant='circular' width={160} height={160} /></Box>
      )}
      {showResult && dataReady && pieMounted && (
        <Box sx={{ display: viewMode === 'pie' ? 'block' : 'none' }}>
          <PieChartView options={coloredOptions} voteCounts={voteCounts} size={pieSize} />
        </Box>
      )}
      {showResult && dataReady && barsMounted && (
        <Box sx={{ display: viewMode === 'bars' ? 'block' : 'none' }}>
          <BarChartView options={coloredOptions} voteCounts={voteCounts} />
        </Box>
      )}
    </>
  )
}

OptionsList.propTypes = {
  options: PropTypes.array.isRequired,
  option: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  poll: PropTypes.object.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default OptionsList
