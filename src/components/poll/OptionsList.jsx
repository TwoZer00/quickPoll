import { useMemo, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Chip, RadioGroup, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import { BallotOutlined, DonutLarge, BarChart as BarChartIcon, HowToVote } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabase/init'
import { assignColors } from '../../utils/color'
import Option from './Option'
import PieChartView from '../charts/PieChartView'
import BarChartView from '../charts/BarChartView'

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

  return { voteCounts, applyOptimistic, revertOptimistic }
}

const OptionsList = ({ poll, handleChange, option, options, voteCounts, disableUrlSync = false, initialView, forceShowResult = false, isVoted = false, onViewChange }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const paramView = searchParams.get('resultsOnly')?.toLowerCase()
  const [viewMode, setViewMode] = useState(VALID_VIEWS.includes(paramView) ? paramView : initialView ?? (poll.closed ? 'bars' : 'vote'))
  const total = useMemo(() => Object.values(voteCounts).reduce((a, b) => a + b, 0), [voteCounts])
  const coloredOptions = useMemo(() => assignColors(options), [options])
  const showResult = forceShowResult || coloredOptions.some(option => option.voted) || poll.closed
  const dataReady = Object.keys(voteCounts).length === coloredOptions.length
  const hasImages = coloredOptions.some(opt => opt.image)
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
        <Stack direction='row' alignItems='center' justifyContent='space-between' gap={1} flexWrap='wrap'>
          <Chip icon={<HowToVote fontSize='small' />} label={<Typography variant='caption' fontWeight={600}>{total}</Typography>} size='small' variant='outlined' />
          <ToggleButtonGroup
            size='small' value={viewMode} exclusive onChange={handleViewChange}
            sx={{ gap: 1, '& .MuiToggleButton-root': { borderRadius: '20px !important', px: 2, minWidth: 48, minHeight: 48, border: '1px solid', borderColor: 'divider' } }}
            aria-label='Results view'
          >
            {!poll.closed && (
              <Tooltip
                title={!isVoted ? t('mock.voteTooltip') : ''}
                open={!isVoted}
                placement='top'
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      px: 1.5, py: 0.75,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(57,73,171,0.4)',
                      animation: 'tooltipPulse 2s ease-in-out infinite',
                      '@keyframes tooltipPulse': {
                        '0%,100%': { boxShadow: '0 4px 12px rgba(57,73,171,0.4)' },
                        '50%': { boxShadow: '0 4px 20px rgba(57,73,171,0.7)' }
                      }
                    }
                  },
                  arrow: { sx: { color: 'primary.main' } }
                }}
              >
                <ToggleButton value='vote' aria-label='Vote view'><BallotOutlined fontSize='small' /></ToggleButton>
              </Tooltip>
            )}
            <ToggleButton value='bars' aria-label='Bar chart'><BarChartIcon fontSize='small' /></ToggleButton>
            <ToggleButton value='pie' aria-label='Pie chart'><DonutLarge fontSize='small' /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
      <Box sx={{ display: viewMode === 'vote' ? 'block' : 'none' }}>
        <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option} sx={{ display: hasImages ? 'grid' : 'flex', gridTemplateColumns: hasImages ? { xs: 'repeat(2, 1fr)', sm: `repeat(${cols}, 1fr)` } : undefined, flexDirection: 'column', gap: 1.5, maxHeight: hasImages ? 640 : 300, overflowY: 'clip', px: hasImages ? 1 : 0, mx: hasImages ? -1 : 0, py: hasImages ? 2.5 : 0, my: hasImages ? 0.5 : 0 }}>
          {coloredOptions.map((opt) => (
            <Option key={opt.id} poll={poll} option={opt} voteCount={voteCounts[opt.id] || 0} total={total} showResult={showResult} cardMode={hasImages} compact={cols >= 3} selected={option} />
          ))}
        </RadioGroup>
      </Box>
      {!dataReady && viewMode === 'pie' && (
        <Box display='flex' justifyContent='center' alignItems='center' height={200}><Skeleton variant='circular' width={160} height={160} /></Box>
      )}
      {showResult && dataReady && pieMounted && (
        <Box sx={{ display: viewMode === 'pie' ? 'block' : 'none' }}>
          <PieChartView options={coloredOptions} voteCounts={voteCounts} />
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
