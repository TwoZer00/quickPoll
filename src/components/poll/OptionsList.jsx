import { useMemo, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, RadioGroup, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { BarChart as BarChartIcon, BallotOutlined, PieChart as PieChartIcon } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { collection, query, onSnapshot, getFirestore } from 'firebase/firestore'
import { generateColorBySeed } from '../../utils/color'
import Option from './Option'
import PieChartView from '../charts/PieChartView'
import BarChartView from '../charts/BarChartView'

const VALID_VIEWS = ['vote', 'pie', 'bars']
const DEBOUNCE_MS = 300

function useVoteCounts (pollId, options) {
  const [voteCounts, setVoteCounts] = useState({})
  const bufferRef = useRef({})
  const timerRef = useRef(null)
  const unsubscribesRef = useRef([])

  useEffect(() => {
    unsubscribesRef.current.forEach(unsub => unsub())
    unsubscribesRef.current = []
    bufferRef.current = {}

    const flush = () => {
      const pending = { ...bufferRef.current }
      setVoteCounts(prev => {
        const hasChanges = Object.keys(pending).some(k => prev[k] !== pending[k])
        return hasChanges ? { ...prev, ...pending } : prev
      })
    }

    const unsubs = options.map(opt => {
      const q = query(collection(getFirestore(), 'polls', pollId, 'options', opt.id, 'votes'))
      return onSnapshot(q, (snap) => {
        bufferRef.current[opt.id] = snap.docs.length
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(flush, DEBOUNCE_MS)
      }, (error) => {
        console.error('Snapshot listener error:', error)
      })
    })
    unsubscribesRef.current = unsubs

    return () => {
      clearTimeout(timerRef.current)
      unsubs.forEach(unsub => unsub())
    }
  }, [pollId, options])

  return voteCounts
}

const OptionsList = ({ poll, handleChange, option, options }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramView = searchParams.get('resultsOnly')?.toLowerCase()
  const [viewMode, setViewMode] = useState(VALID_VIEWS.includes(paramView) ? paramView : poll.closed ? 'pie' : 'vote')
  const voteCounts = useVoteCounts(poll.id, options)
  const total = useMemo(() => Object.values(voteCounts).reduce((a, b) => a + b, 0), [voteCounts])
  const showResult = options.some(option => option.voted) || poll.closed
  const dataReady = Object.keys(voteCounts).length === options.length
  const hasImages = options.some(opt => opt.image)
  const cols = Math.min(options.length, 4)

  const handleViewChange = (_, v) => {
    if (!v) return
    setViewMode(v)
    setSearchParams(prev => {
      if (v === 'vote') { prev.delete('resultsOnly') } else { prev.set('resultsOnly', v) }
      return prev
    }, { replace: true })
  }

  return (
    <>
      {showResult && total > 0 && (
        <ToggleButtonGroup
          size='small' value={viewMode} exclusive onChange={handleViewChange}
          sx={{ alignSelf: 'center', gap: 1, '& .MuiToggleButton-root': { borderRadius: '20px !important', px: 2, minWidth: 48, minHeight: 48, border: '1px solid', borderColor: 'divider' } }}
          aria-label='Results view'
        >
          {!poll.closed && <ToggleButton value='vote' aria-label='Vote view'><BallotOutlined fontSize='small' /></ToggleButton>}
          <ToggleButton value='pie' aria-label='Pie chart'><PieChartIcon fontSize='small' /></ToggleButton>
          <ToggleButton value='bars' aria-label='Bar chart'><BarChartIcon fontSize='small' /></ToggleButton>
        </ToggleButtonGroup>
      )}
      <Box sx={{ display: viewMode === 'vote' ? 'block' : 'none' }}>
        <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option} sx={{ display: hasImages ? 'grid' : 'flex', gridTemplateColumns: hasImages ? { xs: '1fr', sm: `repeat(${cols}, 1fr)` } : undefined, flexDirection: 'column', gap: 1.5, maxHeight: hasImages ? 'none' : 300, overflowY: 'auto' }}>
          {options.map((opt) => (
            <Option key={opt.id} poll={poll} option={opt} voteCount={voteCounts[opt.id] || 0} total={total} showResult={showResult} cardMode={hasImages} selected={option} />
          ))}
        </RadioGroup>
      </Box>
      {showResult && dataReady && viewMode !== 'vote' && (
        <Stack gap={0.5}>
          {options.map(opt => {
            const count = voteCounts[opt.id] || 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <Stack key={opt.id} direction='row' justifyContent='space-between' alignItems='center' px={1} py={0.5} borderRadius={2} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <Stack direction='row' alignItems='center' gap={1}>
                  {opt.image
                    ? <Box component='img' src={opt.image} alt={opt.title} sx={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: generateColorBySeed(opt.id), flexShrink: 0 }} />}
                  <Typography variant='body2'>{opt.title}</Typography>
                </Stack>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>{count} · {pct}%</Typography>
              </Stack>
            )
          })}
        </Stack>
      )}
      {!dataReady && viewMode !== 'vote' && (
        viewMode === 'pie'
          ? <Box display='flex' justifyContent='center' alignItems='center' height={200}><Skeleton variant='circular' width={160} height={160} /></Box>
          : <Box display='flex' alignItems='end' justifyContent='center' gap={1} height={200} pb={3}>{[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (<Skeleton key={i} variant='rounded' width={32} height={`${h * 70}%`} />))}</Box>
      )}
      {showResult && dataReady && (
        <>
          <Box sx={{ display: viewMode === 'pie' ? 'block' : 'none' }}>
            <Typography variant='caption' align='center' display='block' aria-live='polite'>{total} vote{total !== 1 ? 's' : ''}</Typography>
            <PieChartView options={options} voteCounts={voteCounts} />
          </Box>
          <Box sx={{ display: viewMode === 'bars' ? 'block' : 'none' }}>
            <Typography variant='caption' align='center' display='block' aria-live='polite'>{total} vote{total !== 1 ? 's' : ''}</Typography>
            <BarChartView options={options} voteCounts={voteCounts} />
          </Box>
        </>
      )}
    </>
  )
}

OptionsList.propTypes = {
  options: PropTypes.array.isRequired,
  option: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  poll: PropTypes.object.isRequired
}

export default OptionsList
