import { useLoaderData, useParams } from 'react-router-dom'
import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getPoll, getResults, setVote } from '../firebase/utils'

export default function Poll () {
  const [data, setData] = useState()
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
      })
    // console.log(getResults(id))
  }
  const handleChange = (event) => {
    setOption(event.target.value)
  }
  const porcentage = (votes) => Math.round((votes / results?.reduce((acc, option) => acc + option.votes, 0) * 100))
  return (
    <Box component='form' onSubmit={handleSubmit}>
      <Typography variant='h1'>Poll {data?.title}</Typography>
      <RadioGroup name='radio-buttons-group' onChange={handleChange} value={option}>
        {
          options.map((option) => (
            <FormControlLabel key={option.id} value={option.id} label={`${option.title} ${results ? results?.find(optionx => optionx.id === option.id).votes + ' ' + porcentage(results?.find(optionx => optionx.id === option.id)?.votes) + '%' : ''}`} control={<Radio />} />
          ))
        }
      </RadioGroup>
      <Button type='submit' variant='contained' disabled={options.find(option => option.voted)?.id === option}>vote</Button>
    </Box>
  )
}
