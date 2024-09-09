import { useLoaderData, useOutletContext, useParams } from 'react-router-dom'
import { Box, Button, CssBaseline, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getPoll, getResults, setVote } from '../firebase/utils'
import { Share } from '@mui/icons-material'

export default function Poll () {
  const [data, setData] = useState()
  const [,, setMessage] = useOutletContext()
  const [options, setOptions] = useState(useLoaderData())
  const [option, setOption] = useState(options.find(option => option.voted)?.id || options[0].id)
  const [results, setResults] = useState()
  const { id } = useParams()
  useEffect(() => {
    const getData = async () => {
      const tempData = await getPoll(id)
      if (options.find(option => option.voted)?.id === option) {
        const results = await getResults(id)
        setResults(results)
      }
      setData(tempData)
    }
    if (!data) getData()
  }, [data, id, option, options])
  const handleSubmit = (event) => {
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
        getResults(id).then(results => setResults(results))
        setMessage({ message: 'vote sent', severity: 'success' })
      }).catch((error) => {
        setMessage({ message: error.message, severity: 'error' })
      })
  }
  const handleChange = (event) => {
    setOption(event.target.value)
  }
  const porcentage = (votes) => Math.round((votes / results?.reduce((acc, option) => acc + option.votes, 0) * 100))
  return (
    <>
      <CssBaseline />
      <Box height='100dvh' sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box display='block' textAlign='center'>
          <Typography variant='h2' fontSize={32} fontWeight='bold'>QuickPoll</Typography>
          <Typography variant='subtitle1' fontSize={14}>Create, share and see in real time your polls</Typography>
        </Box>
        <Box height='100%' component='form' onSubmit={handleSubmit} m={2} display='flex' alignItems='center' justifyContent='center'>
          <Box component={Paper} minWidth='xl' width='100%' maxWidth='lg' variant='elevation' elevation={3} p={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option}>
              {
          options.map((option) => (
            <FormControlLabel key={option.id} value={option.id} label={`${option.title} ${results ? results?.find(optionx => optionx.id === option.id).votes + ' ' + porcentage(results?.find(optionx => optionx.id === option.id)?.votes) + '%' : ''}`} control={<Radio />} />
          ))
        }
            </RadioGroup>
            <Button type='submit' variant='contained' sx={{ alignSelf: 'end' }} disabled={options.find(option => option.voted)?.id === option}>vote</Button>
          </Box>
        </Box>
      </Box>
    </>
  )
}
