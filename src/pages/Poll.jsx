import { useLoaderData, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { alpha, Box, Button, CssBaseline, FormControlLabel, IconButton, LinearProgress, Paper, Radio, RadioGroup, Stack, Typography, useTheme } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { getPoll, getResults, getSuscribeOption, setVote, requuestStateEnum } from '../firebase/utils'
import { Share } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
// import  crypto
import { v4 as uuidv4 } from 'uuid'

export default function Poll () {
  const [data, setData] = useState()
  const [,, setMessage] = useOutletContext()
  const [state, setState] = useState()
  const [options, setOptions] = useState(useLoaderData())
  const [option, setOption] = useState(options.find(option => option.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const { id } = useParams()

  useEffect(() => {
    const getData = async () => {
      const tempData = await getPoll(id)
      if (options.find(option => option.voted)?.id === option) {
        const results = await getResults(id, options)
        setResults(() => {
          return results
        })
      }
      setData(tempData)
    }
    if (!data) getData()
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
        setMessage({ message: error.message, severity: 'error' })
        setState(requuestStateEnum.error)
      })
  }

  return (
    <>
      <CssBaseline />
      <Box height='100dvh' sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box display='block' textAlign='center'>
          <Typography variant='h2' fontSize={32} fontWeight='bold'>QuickPoll</Typography>
          <Typography variant='subtitle1' fontSize={14}>Create, share and see in real time your polls</Typography>
        </Box>
        <Box height='100%' component='form' onSubmit={handleSubmit} m={2} display='flex' alignItems='center' justifyContent='center'>
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
              <Typography variant='h1' fontSize={28} fontWeight='400'>{data?.title}</Typography>
              {data?.user && <Typography variant='subtitle1'>created by {data?.user?.name}</Typography>}
              <OptionsList poll={{ ...data, id }} options={options} option={option} setOptions={setOptions} handleChange={(event) => setOption(event.target.value)} results={results} id={id} setResults={setResults} />
              <Button type='submit' variant='contained' sx={{ alignSelf: 'end' }} disabled={options.find(option => option.voted)?.id === option || state === requuestStateEnum.pending}>vote</Button>
            </Box>
            <LinearProgress variant='indeterminate' sx={{ visibility: state === requuestStateEnum.pending ? 'visible' : 'hidden' }} />
          </Box>
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
          <Option key={option.id} poll={poll} option={option} totalOpt={setTempOpt} total={total} showResult={options.some(option => option.voted)} />
        ))
      }
    </RadioGroup>
  )
}

const Option = ({ poll, option, showResult, totalOpt, total }) => {
  const unsuscribe = useRef()
  const optionColor = useRef(generateColorBySeed(option.id))
  const [voutCounter, setVoutCounter] = useState(0)
  const sprig = useSpring(
    { number: voutCounter || 0, from: { number: 0 }, config: { duration: 500 } }
  )
  useEffect(() => {
    if (!unsuscribe.current) {
      unsuscribe.current = getSuscribeOption(poll, option, voutCounter, setVoutCounter, totalOpt)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Box position='relative' display='flex' gap={1} alignItems='center' borderRadius='5rem' overflow='hidden'>
      <Stack direction='row' flex={1} zIndex={1} px={1}>
        <FormControlLabel
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
      <Box position='absolute' left={0} top={0} flex={1} height='100%' zIndex={0} borderRadius='5rem' bgcolor={alpha(optionColor.current, 0.2)} width={`${showResult ? (voutCounter / total) * 100 : 0}%`} sx={{ transition: 'width .75s' }} />
    </Box>
  )
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
// given id(fdBoIY6Bcu1r5q6PvDfx) generate color using it as seed
function generateColorBySeed (seed) {
  const hash = uuidv4(seed)
  const color = parseInt(hash.substring(0, 6), 16)
  // exclude white and black colors
  if (color < 0x7FFFFF && color > 0x000000) return `#${color.toString(16).padStart(6, '0')}`
  // if color is white or black generate another color
  return generateColorBySeed(seed + 1)
}
