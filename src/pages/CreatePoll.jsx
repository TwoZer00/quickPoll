import { Add, PlusOne, Remove, Share } from '@mui/icons-material'
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { createPoll } from '../firebase/utils'

const requuestStateEnum = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  error: 'error'
}

export default function CreatePoll () {
  const [options, setOptions] = useState([{ index: 0 }])
  const [requestState,setRequestState] = useState(requuestStateEnum.none)
  const handleClick = () => setOptions([...options, { index: (options[options.length - 1].index + 1) }])
  const handleRemove = (index) => setOptions(options.filter(item => item.index !== index))
  const handleSubmit = (e) => {
    setRequestState(requuestStateEnum.pending)
    e.preventDefault()
    const target = e.target
    const formData = new FormData(target)
    const data = Object.fromEntries(formData)
    createPoll(data).then(()=>
        setRequestState(requuestStateEnum.success)
    )
    console.log(data)
  }
  return (
    <Box>
      <Typography variant='h1'>Create poll</Typography>
      <Stack direction='row' alignItems='center'>
        <Button onClick={handleClick} startIcon={<Add />}>
          add option
        </Button>
      </Stack>
      <Box component='form' maxWidth='md' display='flex' flexDirection='column' gap={1} onSubmit={handleSubmit}>
        <RadioGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {options.map(item => {
            return (
              <Box key={item.index} display='flex' flexDirection='row' alignItems='center'>
                <TextField variant='filled' label='option' name={`option ${item.index}`} required />
                <Button startIcon={<Remove />} onClick={() => handleRemove(item.index)} disabled={!(options.length > 1)}>remove option</Button>
              </Box>
            )
          })}
        </RadioGroup>
        <Button type='submit' variant='contained'>
          create poll
        </Button>
        {requestState === requuestStateEnum.pending && <Typography>creating poll...</Typography>}
        {requestState === requuestStateEnum.success && <Typography>poll created!</Typography>}
        {requestState === requuestStateEnum.error && <Typography>error creating poll</Typography>}
        {requestState === requuestStateEnum.success && <Button startIcon={<Share />}>share poll</Button>}
      </Box>
    </Box>
  )
}
