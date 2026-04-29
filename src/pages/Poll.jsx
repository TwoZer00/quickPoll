import { useLoaderData, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { alpha, Box, Button, FormControlLabel, IconButton, LinearProgress, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Radio, RadioGroup, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { memo, useMemo, useEffect, useRef, useState } from 'react'
import { getResults, setVote, requestStateEnum } from '../firebase/utils'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import { BarChart as BarChartIcon, BallotOutlined, PieChart as PieChartIcon, Share } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import ERRORS from '../const/Const'
import dayjs from 'dayjs'
import GoogleAd from '../components/GoogleAd'
import useTitle from '../hook/useTitle'

export default function Poll () {
  const [data, setData] = useState((useLoaderData()))
  const [,, setMessage] = useOutletContext()
  const [state, setState] = useState()
  const [options, setOptions] = useState(data.options)
  const [option, setOption] = useState(options.find(option => option.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const [duration, setDuration] = useState()
  const { id } = useParams()
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
    const data = new FormData(event.currentTarget)
    const selectedOption = data.get('radio-buttons-group')
    setVote({ lastVote: options.find(option => option.voted), voteId: selectedOption, pollId: id })
      .then(() => {
        // clean all options from voted
        const tempOptions = options.map(option => ({ ...option, voted: false }))
        setOptions(tempOptions)
        // set selected option as voted
        setOptions(tempOptions.map(option => option.id === selectedOption ? { ...option, voted: true } : option))
        setOption(selectedOption)
        setMessage({ message: 'vote sent', severity: 'success' })
        setState(requestStateEnum.success)
      }).catch((error) => {
        setMessage({ message: ERRORS[error.code], severity: 'error' })
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
      !isVoted() && setOption('-1')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const isVoted = () => {
    return options.some(option => option.voted)
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Stack flex={1} justifyContent='center' alignItems='center' sx={{ flexDirection: { xs: 'column', xl: 'row' }, gap: 2, p: 2 }}>
          <Box sx={{ display: { xs: 'none', xl: 'flex' }, maxWidth: 300, width: '100%' }} className='ad-wrapper'>
            <GoogleAd adSlot='3837806330' />
          </Box>
          <Box flex={1} component='form' onSubmit={handleSubmit} display='flex' alignItems='center' justifyContent='center' width='100%' maxWidth='md'>
            <Box component={Paper} width='100%' variant='elevation' elevation={3} sx={{ overflow: 'hidden' }}>
              <Box component='main' p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ShareMenu pollId={id} setMessage={setMessage} />
                {
                data?.title
                  ? <Typography variant='h4' component='h1' fontWeight={500} maxWidth='30ch' title={data?.title} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{data?.title}</Typography>
                  : <Skeleton variant='text' height={32} width='12ch' />
              }
                {data?.user && <Typography variant='subtitle1'>created by {data?.user?.name}</Typography>}
                {!data?.closed
                  ? (
                    <TimeRemain duration={duration} setDuration={setDuration} date={data && data?.createdAt?.seconds * 1000} />
                    )
                  : (
                    <Typography variant='caption'>
                      Created at {dayjs(data.createdAt.seconds * 1000).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                    )}
                <OptionsList poll={{ ...data, id }} options={options} option={option} setOptions={setOptions} handleChange={(event) => setOption(event.target.value)} results={results} id={id} setResults={setResults} />
                {!data?.closed && <Button type='submit' variant='contained' sx={{ alignSelf: 'end' }} disabled={!data || (options.find(option => option.voted)?.id === option || state === requestStateEnum.pending)}>vote</Button>}
                {data?.closed && <Typography variant='body2' color='text.secondary' align='center'>Poll closed — {Object.values(options).length} options</Typography>}
              </Box>
              <LinearProgress variant='indeterminate' sx={{ visibility: state === requestStateEnum.pending ? 'visible' : 'hidden' }} />
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', xl: 'flex' }, maxWidth: 300, width: '100%' }} className='ad-wrapper'>
            <GoogleAd adSlot='5542566407' />
          </Box>
        </Stack>
      </Box>
    </>
  )
}

const VALID_VIEWS = ['vote', 'pie', 'bars']

const SHARE_OPTIONS = [
  { label: 'Share poll', param: null, icon: <BallotOutlined fontSize='small' /> },
  { label: 'Share as pie chart', param: 'pie', icon: <PieChartIcon fontSize='small' /> },
  { label: 'Share as bar chart', param: 'bars', icon: <BarChartIcon fontSize='small' /> }
]

const ShareMenu = ({ pollId, setMessage }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleShare = (param) => {
    const url = new URL(window.location.href)
    url.search = ''
    if (param) url.searchParams.set('resultsOnly', param)
    navigator.clipboard.writeText(url.toString()).then(() => setMessage({ message: 'link copied to clipboard' }))
    setAnchorEl(null)
  }

  return (
    <Box display='flex' alignSelf='end'>
      <IconButton size='small' aria-label='Share poll' onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Share fontSize='inherit' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {SHARE_OPTIONS.map(({ label, param, icon }) => (
          <MenuItem key={label} onClick={() => handleShare(param)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

ShareMenu.propTypes = {
  pollId: PropTypes.string,
  setMessage: PropTypes.func
}

const DEBOUNCE_MS = 300

function useVoteCounts(pollId, options) {
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
        <ToggleButtonGroup size='small' value={viewMode} exclusive onChange={handleViewChange} sx={{ alignSelf: 'center' }} aria-label='Results view'>
          {!poll.closed && <ToggleButton value='vote' aria-label='Vote view'><BallotOutlined fontSize='small' /></ToggleButton>}
          <ToggleButton value='pie' aria-label='Pie chart'><PieChartIcon fontSize='small' /></ToggleButton>
          <ToggleButton value='bars' aria-label='Bar chart'><BarChartIcon fontSize='small' /></ToggleButton>
        </ToggleButtonGroup>
      )}
      {viewMode === 'vote' && (
        <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option} sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
          {
            options.map((opt) => (
              <Option key={opt.id} poll={poll} option={opt} voteCount={voteCounts[opt.id] || 0} total={total} showResult={showResult} />
            ))
          }
        </RadioGroup>
      )}
      {showResult && dataReady && (viewMode === 'pie' || viewMode === 'bars') && (
        <Stack gap={0.5}>
          {options.map(opt => {
            const count = voteCounts[opt.id] || 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <Stack key={opt.id} direction='row' justifyContent='space-between' alignItems='center' px={1}>
                <Stack direction='row' alignItems='center' gap={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: generateColorBySeed(opt.id), flexShrink: 0 }} />
                  <Typography variant='body2'>{opt.title}</Typography>
                </Stack>
                <Typography variant='body2' fontWeight={600} color='text.secondary'>{count} · {pct}%</Typography>
              </Stack>
            )
          })}
        </Stack>
      )}
      {viewMode === 'pie' && !dataReady && (
        <Box display='flex' justifyContent='center' alignItems='center' height={250}>
          <Skeleton variant='circular' width={160} height={160} />
        </Box>
      )}
      {viewMode === 'bars' && !dataReady && (
        <Box display='flex' alignItems='end' justifyContent='center' gap={1} height={250} pb={3}>
          {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
            <Skeleton key={i} variant='rounded' width={32} height={`${h * 70}%`} />
          ))}
        </Box>
      )}
      {viewMode === 'pie' && dataReady && (
        <>
          <Typography variant='caption' align='center' aria-live='polite'>{total} vote{total !== 1 ? 's' : ''}</Typography>
          <PieChartView options={options} voteCounts={voteCounts} />
        </>
      )}
      {viewMode === 'bars' && dataReady && (
        <>
          <Typography variant='caption' align='center' aria-live='polite'>{total} vote{total !== 1 ? 's' : ''}</Typography>
          <BarChartView options={options} voteCounts={voteCounts} />
        </>
      )}
    </>
  )
}

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle' dominantBaseline='central' fontSize={13} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

const PieChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, value: voteCounts[opt.id] || 0, color: generateColorBySeed(opt.id) }))
    .filter(d => d.value > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  return (
    <ResponsiveContainer width='100%' height={250}>
      <PieChart role='img' aria-label='Pie chart of poll results'>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={90} animationDuration={500} label={renderLabel} labelLine={false}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
})

PieChartView.displayName = 'PieChartView'

PieChartView.propTypes = {
  options: PropTypes.array,
  voteCounts: PropTypes.object
}

const BarChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, votes: voteCounts[opt.id] || 0, fill: generateColorBySeed(opt.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  return (
    <ResponsiveContainer width='100%' height={250}>
      <BarChart data={data} role='img' aria-label='Bar chart of poll results'>

        <XAxis dataKey='name' />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => [`${value} votes`, '']} />
        <Bar dataKey='votes' animationDuration={500}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})

BarChartView.displayName = 'BarChartView'

BarChartView.propTypes = {
  options: PropTypes.array,
  voteCounts: PropTypes.object
}

const Option = memo(({ poll, option, showResult, voteCount, total }) => {
  const optionColor = useRef(generateColorBySeed(option.id))
  const percentage = total > 0 && showResult ? (voteCount / total) * 100 : 0
  const sprig = useSpring(
    { number: voteCount, from: { number: 0 }, config: { duration: 500 } }
  )

  return (
    <Box position='relative' display='flex' gap={1} alignItems='center' borderRadius='5rem' overflow='hidden' height='3rem' role='option' aria-selected={!!option.voted} aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${Math.round((voteCount / total) * 100)}%` : ''}`}>
      <Stack direction='row' flex={1} zIndex={1} px={1}>
        <FormControlLabel
          disabled={poll.closed}
          sx={{ flex: 1 }} value={option.id} label={`${option.title} `}
          control={
            <Radio
              sx={{
                color: `${optionColor.current}`,
                '&.Mui-checked': {
                  color: `${optionColor.current}`
                }
              }}
            />
          }
        />
        <Typography variant='caption' sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }} fontSize={14}>
          {(showResult) && <animated.p>{sprig.number.to(x => x.toFixed(0))}</animated.p>}
          {(showResult && voteCount > 0) && (<><animated.p style={{ fontStyle: 'inherit' }}>{sprig.number.to(x => Math.round((x.toFixed(0) / total) * 100))}</animated.p>%</>)}
        </Typography>
      </Stack>
      <PercentageBar percentage={percentage} color={optionColor.current} />
    </Box>
  )
})

Option.displayName = 'Option'

const PercentageBar = ({ percentage, color }) => {
  return (
    <Box height='100%' position='absolute' flex={1} left={0} top={0} zIndex={0} borderRadius='5rem' width={`${percentage}%`} overflow='hidden' sx={{ transition: 'width .75s' }}>
      <Box height='100%' bgcolor={alpha(color, 0.2)} />
    </Box>
  )
}

PercentageBar.propTypes = {
  percentage: PropTypes.number,
  color: PropTypes.string
}

Option.propTypes = {
  option: PropTypes.object,
  poll: PropTypes.object,
  showResult: PropTypes.bool,
  voteCount: PropTypes.number,
  total: PropTypes.number
}

OptionsList.propTypes = {
  options: PropTypes.array,
  option: PropTypes.string,
  handleChange: PropTypes.func,
  results: PropTypes.array,
  poll: PropTypes.object
}
generateColorBySeed.propTypes = {
  seed: PropTypes.string
}

/**
 * Given an uid generate color in hexadecimal
 * @param {string} seed uid generated by firebase e.x. fdBoIY6Bcu1r5q6PvDfxfdBoIY6Bcu1r5q6PvDfx
 * @returns {string} color in hex format e.x. #ff0000
 */
function generateColorBySeed (seed) {
  // Use a more efficient hashing algorithm
  const hash = simpleHash(seed.toString())

  // Generate color in HSL space for better distribution
  const hue = hash % 360
  const saturation = 70 + (hash % 30) // 70-100%
  const lightness = 40 + (hash % 20) // 40-60%

  // Convert HSL to HEX
  return hslToHex(hue, saturation, lightness)
}

function simpleHash (str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function hslToHex (h, s, l) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Time remain component
 * @param {object} props
 * @param {string} props.date date in miliseconds
 * @returns {JSX.Element}
 */
function TimeRemain ({ date, setDuration }) {
  const [time, setTime] = useState()
  const [diff, setDiff] = useState()

  useEffect(() => {
    const diff = (1800 - dayjs().diff(dayjs(date), 's'))
    if (diff >= 0) setDiff(diff)
    const interval = setInterval(() => {
      const diff = (1800 - dayjs().diff(dayjs(date), 's'))
      if (diff >= 0) setDiff(diff)
      if (diff <= 0) { return clearInterval(interval) }
    }, 1000)
    return () => clearInterval(interval)
  }, [date])
  useEffect(() => {
    if (diff >= 0) {
      setDuration(diff)
    }
  }, [diff, setDuration])

  useEffect(() => {
    if (diff > 60) setTime(`${(diff / 60).toFixed(0)} minutes`)
    if (diff <= 60) setTime(`${diff} second${diff !== 1 ? 's' : ''}`)
  }, [diff])

  if (date && diff) {
    return (
      <Typography variant='caption' role='timer' aria-live='polite'>Time remaining {time}</Typography>
    )
  } else {
    return (
      <Skeleton variant='text' width={100} />
    )
  }
}
TimeRemain.propTypes = {
  date: PropTypes.number,
  setDuration: PropTypes.func
}

/**
 * Convert miliseconds to time
 * @param {number} date miliseconds
 * @returns {string}
 */
