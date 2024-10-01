import { useLoaderData, useOutletContext, useParams, Link as RouterLink } from 'react-router-dom'
import { Alert, alpha, Box, Button, CssBaseline, FormControlLabel, IconButton, LinearProgress, Link, Paper, Radio, RadioGroup, Skeleton, Stack, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { getResults, getSuscribeOption, setVote, requuestStateEnum } from '../firebase/utils'
import { Share } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
import ERRORS from '../const/Const'
import dayjs from 'dayjs'
import GoogleAd from '../components/GoogleAd'

export default function Poll () {
  const [data, setData] = useState((useLoaderData()))
  const [,, setMessage] = useOutletContext()
  const [state, setState] = useState()
  const [options, setOptions] = useState(data.options)
  const [option, setOption] = useState(options.find(option => option.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const [duration, setDuration] = useState()
  const { id } = useParams()

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
    setState(requuestStateEnum.pending)
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
        setState(requuestStateEnum.success)
      }).catch((error) => {
        setMessage({ message: ERRORS[error.code], severity: 'error' })
        setState(requuestStateEnum.error)
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
  useEffect(() => {
    document.title = `QuickPoll - ${data?.title}`
  }, [data?.title])

  return (
    <>
      <CssBaseline />
      <Box height='100dvh' sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box display='block' textAlign='center'>
          <Typography variant='h1' fontSize={32} fontWeight='bold'>QuickPoll</Typography>
          <Typography variant='subtitle1' fontSize={14}>Create, share and see in real time your polls.</Typography>
          <Link component={RouterLink} to='/' p={1}>Home</Link>
        </Box>
        <Stack flex={1} justifyContent='space-around' sx={{ flexDirection: { sm: 'column', md: 'row' } }}>
          <Box flex={0.25}>
            <GoogleAd />
          </Box>
          <Box flex={1} maxWidth='md' component='form' onSubmit={handleSubmit} m={2} display='flex' alignItems='center' justifyContent='center'>
            <Box component={Paper} minWidth='xl' width='100%' maxWidth='lg' variant='elevation' elevation={3} sx={{ overflow: 'hidden' }}>
              <Box p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display='flex' alignSelf='end' flexDirection='row'>
                  <IconButton
                    size='small' onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => setMessage({ message: 'link paste in clipboard' }))
                    }}
                  >
                    <Share fontSize='inherit' />
                  </IconButton>
                  {/*
              <IconButton size='small'>
                <Flag fontSize='inherit' />
              </IconButton> */}
                </Box>
                {
                data?.title
                  ? <Typography variant='h1' fontSize={32} fontWeight='400'>{data?.title}</Typography>
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
                <Button type='submit' variant='contained' sx={{ alignSelf: 'end' }} disabled={!data || (options.find(option => option.voted)?.id === option || state === requuestStateEnum.pending) || data?.closed}>vote</Button>
                {data?.closed && <Alert severity='warning'>Poll closed.</Alert>}
              </Box>
              <LinearProgress variant='indeterminate' sx={{ visibility: state === requuestStateEnum.pending ? 'visible' : 'hidden' }} />
            </Box>
          </Box>
          <Box flex={0.25}>
            <GoogleAd />
          </Box>
        </Stack>
        <Box textAlign='center'>
          <Typography component='footer' variant='caption'>
            Made with ❤️ by <a target='_blank' rel='noreferrer' href='https://twozer00.dev'>twozer00</a>. <br />
            Create your own poll in <Link component={RouterLink} to='/create'>here</Link>.
          </Typography>
        </Box>
      </Box>
    </>
  )
}

const OptionsList = ({ poll, handleChange, option, options }) => {
  const [tempOpt, setTempOpt] = useState()
  const total = tempOpt ? Object.values(tempOpt).reduce((a, b) => a + b, 0) : 0
  return (
    <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {
        options.map((option) => (
          <Option key={option.id} poll={poll} option={option} totalOpt={setTempOpt} total={total} showResult={options.some(option => option.voted) || poll.closed} />
        ))
      }
    </RadioGroup>
  )
}

const Option = ({ poll, option, showResult, totalOpt, total }) => {
  const unsuscribe = useRef()
  const optionColor = useRef(generateColorBySeed(option.id))
  const [voutCounter, setVoutCounter] = useState()
  const [porcentage, setPorcentage] = useState(0)
  const sprig = useSpring(
    { number: voutCounter || 0, from: { number: 0 }, config: { duration: 500 } }
  )
  useEffect(() => {
    if (!unsuscribe.current) {
      unsuscribe.current = getSuscribeOption(poll, option, voutCounter, setVoutCounter, totalOpt)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (total > 0 && voutCounter >= 0 && showResult) {
      setPorcentage((voutCounter / total) * 100)
    }
  }, [voutCounter, total, showResult])

  return (
    <Box position='relative' display='flex' gap={1} alignItems='center' borderRadius='5rem' overflow='hidden' height='3rem'>
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
          {(showResult && voutCounter) && (<><animated.p style={{ fontStyle: 'inherit' }}>{sprig.number.to(x => Math.round((x.toFixed(0) / total) * 100))}</animated.p>%</>)}
        </Typography>
      </Stack>
      {/* <Box position='absolute' left={0} top={0} flex={1} height='100%' zIndex={0} borderRadius='5rem' bgcolor={alpha(optionColor.current, 0.2)} sx={{ transition: 'width .75s' }} width={porcentage} /> */}
      <PorcentageBar porcentage={porcentage} color={optionColor.current} />
    </Box>
  )
}

const PorcentageBar = ({ porcentage, color }) => {
  return (
    <Box height='100%' position='absolute' flex={1} left={0} top={0} zIndex={0} borderRadius='5rem' width={`${porcentage}%`} overflow='hidden' sx={{ transition: 'width .75s' }}>
      <Box height='100%' bgcolor={alpha(color, 0.2)} />
    </Box>
  )
}

PorcentageBar.propTypes = {
  porcentage: PropTypes.number,
  color: PropTypes.string
}

Option.propTypes = {
  option: PropTypes.object,
  poll: PropTypes.object,
  showResult: PropTypes.bool,
  totalOpt: PropTypes.func,
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
      <Typography variant='caption'>Time remaining {time}</Typography>
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
